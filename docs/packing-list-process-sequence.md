# Packing List Processing Sequence

This diagram shows the detailed sequence of steps for processing an incoming packing list message.

```mermaid
flowchart TD
    Start([Incoming Message]) --> Download

    subgraph Step1 [1. Download]
        Download[Download Packing List<br/>from Blob Storage<br/><i>location from message</i>]
    end

    Download --> Process

    subgraph Step2 [2. Process Packing List]
        Process[Process Packing List] --> GetDispatch[2a. Get Dispatch Location<br/>for Dispatching Exporter]
        GetDispatch --> Parse[2b. Parse Blob Data<br/>Using Appropriate Parser]
    end

    Parse --> Results

    subgraph Step3 [3. Process Results]
        Results[Process Results] --> Persist[3a. Persist Packing<br/>List Information]
        Persist --> Notify[3b. Notify External<br/>Applications]
    end

    Notify --> End([Complete])

    style Start fill:#90EE90
    style End fill:#90EE90
    style Download fill:#87CEEB
    style Process fill:#DDA0DD
    style GetDispatch fill:#DDA0DD
    style Parse fill:#DDA0DD
    style Results fill:#F4A460
    style Persist fill:#F4A460
    style Notify fill:#F4A460
```

## Detailed Process Steps

### Step 1: Download

**Download Packing List from Blob Storage**

- Receives incoming message with blob location
- Downloads the packing list file from Azure Blob Storage
- Prepares data for processing

### Step 2: Process Packing List

**2a. Get Dispatch Location for Dispatching Exporter**

- Queries Dynamics 365 or MDM service
- Retrieves establishment/dispatch location information
- Associates exporter data with the packing list

**2b. Parse Blob Data Using Appropriate Parser**

- Identifies the packing list format (Excel, CSV, PDF)
- Selects appropriate parser (Savers, Iceland, etc.)
- Extracts structured data from the packing list
- Validates required fields and business rules

### Step 3: Process Results

**3a. Persist Packing List Information**

- Saves parsed data to database/storage
- Records validation results
- Stores metadata and audit information

**3b. Notify External Applications**

- Sends completion notification via Service Bus
- Includes parsing status (success/failure)
- Triggers downstream workflows
- Enables external systems to react to new data

## Integration Points

- **Azure Blob Storage**: Source of packing list files
- **Dynamics 365/MDM**: Dispatch location lookup
- **Parser Service**: Format detection and data extraction
- **Database**: Persistence layer
- **Service Bus**: Notification mechanism
