# Packing List End-to-End Journey

## Purpose

This document describes the wider journey of a packing list through the trade
exports environment. It starts with an Export application in EHCO, includes
the Packing List Parser (PLP) processing boundary, and ends with the result
being available to IDCOMS and structured data being synchronized to TDS. It
also shows how Trader Risk Profile (TRP) uses this and other data to update
IDCOMS daily with exporter compliance information.

The detailed parsing and validation steps are documented in the
[Packing List Process](../packing-list-process/source.md). This page focuses
on the systems around that process. EHCO, API2, IDCOMS, GIO and TRP
interactions below combine the supplied business description with the PLP
integration documented in this repository; the two sources are distinguished
in the diagram note.

## Journey at a glance

```mermaid
flowchart TB
    subgraph EHCO["EHCO application"]
        ehcoApp["Export application and General Certificate"]
        ehcoBlob[("Azure Blob Storage<br/>GC document + one Packing List copy")]
        serializer["GC Serializer"]
        ehcoQueue[["EHCO Service Bus Queue<br/>PLP processing trigger"]]
        ehcoListener["EHCO-to-PLP message listener"]

        ehcoApp -->|"uploads GC document"| ehcoBlob
        ehcoApp -->|"uploads one Packing List copy"| ehcoBlob
        ehcoBlob -->|"stored Packing List"| serializer
        serializer -->|"updated Packing List with GC Reference"| ehcoBlob
        ehcoApp -->|"PLP processing-trigger message"| ehcoQueue
        ehcoQueue -->|"queued trigger"| ehcoListener
    end

    subgraph TradePlatform["Trade Platform"]
        notifierQueue[["Packing List Notifier queue<br/>Service Bus"]]
        notifier["Packing List Notifier application"]
        api2Queue[["API2 queue<br/>Service Bus"]]
        api2["API2 application + HTTPS endpoints"]

        notifierQueue -->|"queued EHCO message"| notifier
        api2Queue -->|"queued EHCO message"| api2
    end

    subgraph PLPSystem["Packing List Parser (PLP) system"]
        plpService["PLP service"]
        mdmSync["Hourly MDM reference-data synchronization"]
        mdmCache[("In-memory + S3-backed<br/>reference-data cache")]
        parsedS3[("AWS S3<br/>parsed JSON")]
        tdsSync["Scheduled TDS synchronization"]

        mdmSync -->|"refreshes cached copies"| mdmCache
        mdmCache -->|"ineligible items + country codes<br/>for validation"| plpService
        plpService -->|"parsed and validated JSON"| parsedS3
        parsedS3 -->|"hourly source files"| tdsSync
    end

    subgraph MDM["MDM application"]
        mdmItems[("Ineligible items")]
        mdmCodes[("Country codes")]
        mdmApi["MDM API"]

        mdmItems -->|"dataset"| mdmApi
        mdmCodes -->|"dataset"| mdmApi
    end

    subgraph IDCOMSSystem["IDCOMS"]
        idcoms["External Dynamics 365 system"]
    end

    subgraph CHIPCHOPSystem["CHIP/CHOP (DAERA)"]
        chipChop["DAERA application"]
    end

    subgraph TDSWarehouse["TDS"]
        tdsBlob[("Azure Blob Storage landing")]
        tdsRefresh["Internal data refresh job"]
        tdsData["Refreshed PLP data"]

        tdsBlob -->|"landing data"| tdsRefresh
        tdsRefresh -->|"refreshes every 24 hours"| tdsData
    end

    subgraph GIOSystem["GIO"]
        gio["GIO data warehouse"]
    end

    subgraph TRPSystem["Trader Risk Profile (TRP)"]
        trp["Standalone daily application"]
    end

    ehcoApp -->|"EHCO message: update IDCOMS"| notifierQueue
    notifier -->|"IDCOMS API update"| idcoms
    ehcoApp -->|"separate EHCO message: start API2 process"| api2Queue
    api2 -->|"requests data"| idcoms
    idcoms -->|"requested data"| api2
    api2 -->|"processing-complete notification"| chipChop
    chipChop -->|"HTTPS request for General Certificate data"| api2
    api2 -->|"General Certificate data response"| chipChop

    ehcoListener -->|"HTTPS request Packing List Parsing"| plpService
    ehcoBlob -->|"source Packing List download"| plpService
    plpService -->|"processing outcome notification"| notifierQueue
    plpService -->|"dispatch-location lookup<br/>by establishment ID"| idcoms
    idcoms -->|"dispatch-location details"| plpService
    mdmSync -->|"hourly API request via Azure APIM"| mdmApi
    mdmApi -->|"copies of ineligible items<br/>and country codes"| mdmSync
    tdsSync -->|"uploads JSON; deletes S3 source<br/>after successful transfer"| tdsBlob

    ehcoApp -.->|"General Certificate URL reference"| idcoms
    ehcoApp -.->|"General Certificate URL reference"| chipChop
    ehcoBlob -.->|"Packing List download URL"| idcoms
    ehcoBlob -.->|"Packing List download URL"| chipChop
    idcoms -->|"IDCOMS data"| gio
    gio -->|"requests exporter data"| chipChop
    chipChop -->|"exporter data"| gio
    gio -->|"IDCOMS + CHIP/CHOP data"| trp
    trp -->|"requests PLP data"| tdsData
    tdsData -->|"PLP data response"| trp
    trp -->|"daily exporter-compliance update"| idcoms
```

> **Diagram note:** Each enclosing box is an application/system boundary;
> the nodes inside are its components. Labels on solid connectors describe
> messages, API calls, files or data returned. Dashed connectors show document
> URL references rather than document transfers. EHCO, Trade Platform, MDM,
> IDCOMS, DAERA, GIO and TRP details come from supplied business context;
> PLP's API, MDM, S3 and TDS integrations are documented in this repository.

## Stages

1. **Create the Export application and General Certificate in EHCO.** EHCO
   creates the certificate and uploads its document to EHCO Blob Storage.
   The General Certificate URL is shared with consuming applications.
2. **Store and update the Packing List.** EHCO uploads one Packing List copy
   to its Blob Storage. The GC Serializer updates that stored file with the
   Export application's GC Reference. EHCO shares a download URL with
   consuming applications.
3. **Start the two Trade Platform processes.** EHCO sends separate messages
   to the Trade Platform Service Bus queues:
   - The Packing List Notifier queue message is processed by the Packing List
     Notifier application, which updates IDCOMS through its APIs.
   - The API2 queue message starts API2 processing. API2 retrieves data from
     IDCOMS, notifies DAERA when processing is complete, and serves General
     Certificate data through HTTPS endpoints when requested by DAERA.
4. **Trigger PLP processing.** An EHCO-side message listener consumes the
   PLP processing trigger from the EHCO Service Bus Queue and sends an HTTPS
   request to PLP. The documented endpoint is `POST /process-packing-list`,
   with an `application_id`, `packing_list_blob` URI and an IDCOMS
   establishment identifier.
5. **Download and process the source document.** PLP downloads the file from
   EHCO Blob Storage, resolves dispatch location information using IDCOMS,
   discovers a parser, extracts product lines and applies business
   validations. The detailed flow and outcomes are in
   [Packing List Process](../packing-list-process/source.md).
   PLP sends processing-result notifications through the Trade Platform
   Service Bus to Packing List Notifier, which updates IDCOMS through its APIs.
   This operational result-update route is separate from the S3/TDS/TRP
   analytics and risk-assessment flow below. Notifications can be disabled;
   unrecognised `NOMATCH` outcomes are not notified.
6. **Refresh MDM reference data.** PLP downloads copies of the ineligible
   items and country-codes datasets from the MDM API through Azure APIM every
   hour. It caches the data in memory and S3 for validation.
7. **Persist and transfer structured data.** PLP writes parsed JSON to AWS
   S3. Its scheduled synchronization transfers the files to TDS Azure Blob
   Storage hourly; after a successful transfer, the source file is removed
   from S3.
8. **Refresh TDS data.** A separate job within TDS refreshes its data every
   24 hours.
9. **Update exporter risk information.** TRP is a standalone application
   that runs once a day. It receives IDCOMS data through GIO, requests
   exporter data from CHIP/CHOP through GIO, and requests PLP data from TDS
   before updating IDCOMS with exporter compliance information.
10. **View results and supporting documents.** IDCOMS presents processing
    results to users. Consuming applications use the General Certificate URL
    reference and Packing List download URL to access EHCO documents.
