export default {
  validModel: {
    PackingList_Extract: [
      {
        A: 'GC Ref: RMS/2026/1721152450131'
      },
      {
        A: 'TruckID',
        B: 'Department',
        C: 'SubDepartment',
        D: 'PackageMarks',
        E: 'GoodsDescription',
        F: 'CountryOfOrigin',
        G: 'CommodityCode',
        H: 'NIRMS',
        I: 'EHC',
        J: 'NumberOfPackages',
        K: 'NumberOfIndividualPieces',
        L: 'GrossWeight (KG)',
        M: 'NetWeight (KG)',
        N: 'Type Of Treatment',
        O: 'Nature Of Product',
        P: 'PlaceOfDispatch',
        Q: 'Attestation'
      },
      {
        A: '109880',
        B: '0001 - Gardens',
        C: '0101 - Garden Care',
        D: '880944',
        E: 'Terracotta Pot',
        F: 'PT',
        G: '6913901090',
        H: 'non-NIRMS',
        J: '1',
        K: '1',
        L: '0',
        M: '0.5',
        N: 'General Retail Goods',
        O: 'Ambient Goods',
        P: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT',
        Q: 'CDS attestation text'
      },
      {
        A: '109880',
        B: '0003 - Home Decor',
        C: '0322 - Home Fragrance',
        D: '123456',
        E: 'Scented Candle',
        F: 'GB',
        G: '3105209000',
        H: 'NIRMS',
        J: '4',
        K: '24',
        L: '26',
        M: '24.7',
        N: 'General Retail Goods',
        O: 'Ambient Goods',
        P: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT',
        Q: 'CDS attestation text'
      }
    ]
  },
  validHeadersNoData: {
    PackingList_Extract: [
      {
        A: 'GC Ref: RMS/2026/1721152450131'
      },
      {
        A: 'TruckID',
        B: 'Department',
        C: 'SubDepartment',
        D: 'PackageMarks',
        E: 'GoodsDescription',
        F: 'CountryOfOrigin',
        G: 'CommodityCode',
        H: 'NIRMS',
        I: 'EHC',
        J: 'NumberOfPackages',
        K: 'NumberOfIndividualPieces',
        L: 'GrossWeight (KG)',
        M: 'NetWeight (KG)',
        N: 'Type Of Treatment',
        O: 'Nature Of Product',
        P: 'PlaceOfDispatch',
        Q: 'Attestation'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {
        A: 'GC Ref: RMS/2026/1721152450131'
      },
      {
        A: 'TruckID',
        B: 'Department',
        C: 'SubDepartment',
        D: 'PackageMarks',
        E: 'GoodsDescription',
        F: 'CountryOfOrigin',
        G: 'CommodityCode',
        H: 'NIRMS',
        I: 'EHC',
        J: 'NumberOfPackages',
        K: 'NumberOfIndividualPieces',
        L: 'GrossWeight (KG)',
        M: 'NetWeight (KG)',
        N: 'Type Of Treatment',
        O: 'Nature Of Product',
        P: 'PlaceOfDispatch',
        Q: 'Attestation'
      },
      {
        A: '109880',
        B: '0001 - Gardens',
        C: '0101 - Garden Care',
        D: '880944',
        E: 'Terracotta Pot',
        F: 'PT',
        G: '6913901090',
        H: 'non-NIRMS',
        J: '1',
        K: '1',
        L: '0',
        M: '0.5',
        N: 'General Retail Goods',
        O: 'Ambient Goods',
        P: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT',
        Q: 'CDS attestation text'
      }
    ],
    Sheet2: [
      {
        A: 'GC Ref: RMS/2026/1721152450131'
      },
      {
        A: 'TruckID',
        B: 'Department',
        C: 'SubDepartment',
        D: 'PackageMarks',
        E: 'GoodsDescription',
        F: 'CountryOfOrigin',
        G: 'CommodityCode',
        H: 'NIRMS',
        I: 'EHC',
        J: 'NumberOfPackages',
        K: 'NumberOfIndividualPieces',
        L: 'GrossWeight (KG)',
        M: 'NetWeight (KG)',
        N: 'Type Of Treatment',
        O: 'Nature Of Product',
        P: 'PlaceOfDispatch',
        Q: 'Attestation'
      },
      {
        A: '109880',
        B: '0003 - Home Decor',
        C: '0322 - Home Fragrance',
        D: '123456',
        E: 'Scented Candle',
        F: 'GB',
        G: '3105209000',
        H: 'NIRMS',
        J: '4',
        K: '24',
        L: '26',
        M: '24.7',
        N: 'General Retail Goods',
        O: 'Ambient Goods',
        P: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT',
        Q: 'CDS attestation text'
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        A: 'TruckID',
        B: 'Department',
        C: 'SubDepartment',
        D: 'PackageMarks',
        E: 'GoodsDescription',
        F: 'CountryOfOrigin',
        G: 'CommodityCode',
        H: 'NIRMS',
        I: 'EHC',
        J: 'NumberOfPackages',
        K: 'NumberOfIndividualPieces',
        L: 'GrossWeight (KG)',
        M: 'NetWeight (KG)',
        N: 'Type Of Treatment',
        O: 'Nature Of Product',
        P: 'PlaceOfDispatch',
        Q: 'Attestation'
      },
      {
        A: '109880',
        B: '0001 - Gardens',
        C: '0101 - Garden Care',
        D: '880944',
        E: 'Terracotta Pot',
        F: 'PT',
        G: '6913901090',
        H: 'non-NIRMS',
        J: '1',
        K: '1',
        L: '0',
        M: '0.5',
        N: 'General Retail Goods',
        O: 'Ambient Goods',
        P: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT',
        Q: 'CDS attestation text'
      }
    ],
    Sheet2: [
      {
        A: 'GC Ref: RMS/2026/1721152450131'
      },
      {
        A: 'TruckID',
        B: 'Department',
        C: 'SubDepartment',
        D: 'PackageMarks',
        E: 'GoodsDescription',
        F: 'CountryOfOrigin',
        G: 'CommodityCode',
        H: 'NIRMS',
        I: 'EHC',
        J: 'NumberOfPackages',
        K: 'NumberOfIndividualPieces',
        L: 'GrossWeight (KG)',
        M: 'NetWeight (KG)',
        N: 'Type Of Treatment',
        O: 'Nature Of Product',
        P: 'PlaceOfDispatch',
        Q: 'Attestation'
      },
      {
        A: '109880',
        B: '0003 - Home Decor',
        C: '0322 - Home Fragrance',
        D: '123456',
        E: 'Scented Candle',
        F: 'GB',
        G: '3105209000',
        H: 'NIRMS',
        J: '4',
        K: '24',
        L: '26',
        M: '24.7',
        N: 'General Retail Goods',
        O: 'Ambient Goods',
        P: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT',
        Q: 'CDS attestation text'
      }
    ]
  },
  emptyModel: {
    PackingList_Extract: [
      {
        A: 'GC Ref: RMS/2026/1721152450131'
      },
      {
        A: 'TruckID',
        B: 'Department',
        C: 'SubDepartment',
        D: 'PackageMarks',
        E: 'GoodsDescription',
        F: 'CountryOfOrigin',
        G: 'CommodityCode',
        H: 'NIRMS',
        I: 'EHC',
        J: 'NumberOfPackages',
        K: 'NumberOfIndividualPieces',
        L: 'GrossWeight (KG)',
        M: 'NetWeight (KG)',
        N: 'Type Of Treatment',
        O: 'Nature Of Product',
        P: 'PlaceOfDispatch',
        Q: 'Attestation'
      },
      {
        A: null,
        B: null,
        C: null,
        D: null,
        E: null,
        F: null,
        G: null,
        H: null,
        J: null,
        K: null,
        L: null,
        M: null,
        N: null,
        O: null,
        P: null,
        Q: null
      }
    ]
  },
  wrongEstablishmentMultiple: {
    Sheet1: [
      {
        A: 'GC Ref: RMS/2026/1721152450131'
      },
      {
        A: 'TruckID',
        B: 'Department',
        C: 'SubDepartment',
        D: 'PackageMarks',
        E: 'GoodsDescription',
        F: 'CountryOfOrigin',
        G: 'CommodityCode',
        H: 'NIRMS',
        I: 'EHC',
        J: 'NumberOfPackages',
        K: 'NumberOfIndividualPieces',
        L: 'GrossWeight (KG)',
        M: 'NetWeight (KG)',
        N: 'Type Of Treatment',
        O: 'Nature Of Product',
        P: 'PlaceOfDispatch',
        Q: 'Attestation'
      },
      {
        P: 'INCORRECT'
      }
    ],
    Sheet2: [
      {
        A: 'GC Ref: RMS/2026/1721152450131'
      },
      {
        A: 'TruckID',
        B: 'Department',
        C: 'SubDepartment',
        D: 'PackageMarks',
        E: 'GoodsDescription',
        F: 'CountryOfOrigin',
        G: 'CommodityCode',
        H: 'NIRMS',
        I: 'EHC',
        J: 'NumberOfPackages',
        K: 'NumberOfIndividualPieces',
        L: 'GrossWeight (KG)',
        M: 'NetWeight (KG)',
        N: 'Type Of Treatment',
        O: 'Nature Of Product',
        P: 'PlaceOfDispatch',
        Q: 'Attestation'
      },
      {
        P: 'INCORRECT'
      }
    ]
  },
  incorrectHeaderMultiple: {
    Sheet1: [
      {
        A: 'NOT',
        B: 'CORRECT',
        C: 'HEADER'
      },
      {
        P: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT'
      }
    ],
    Sheet2: [
      {
        A: 'NOT',
        B: 'CORRECT',
        C: 'HEADER'
      },
      {
        P: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT'
      }
    ]
  },
  multipleRms: {
    PackingList_Extract: [
      {
        A: 'GC Ref: RMS/2026/1721152450131'
      },
      {
        A: 'TruckID',
        B: 'Department',
        C: 'SubDepartment',
        D: 'PackageMarks',
        E: 'GoodsDescription',
        F: 'CountryOfOrigin',
        G: 'CommodityCode',
        H: 'NIRMS',
        I: 'EHC',
        J: 'NumberOfPackages',
        K: 'NumberOfIndividualPieces',
        L: 'GrossWeight (KG)',
        M: 'NetWeight (KG)',
        N: 'Type Of Treatment',
        O: 'Nature Of Product',
        P: 'PlaceOfDispatch',
        Q: 'Attestation'
      },
      {
        A: '109880',
        B: '0001 - Gardens',
        C: '0101 - Garden Care',
        D: '880944',
        E: 'Terracotta Pot',
        F: 'PT',
        G: '6913901090',
        H: 'non-NIRMS',
        J: '1',
        K: '1',
        L: '0',
        M: '0.5',
        N: 'General Retail Goods',
        O: 'Ambient Goods',
        P: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT',
        Q: 'CDS attestation text'
      },
      {
        A: '109880',
        B: '0003 - Home Decor',
        C: '0322 - Home Fragrance',
        D: '123456',
        E: 'Scented Candle',
        F: 'GB',
        G: '3105209000',
        H: 'NIRMS',
        J: '4',
        K: '24',
        L: '26',
        M: '24.7',
        N: 'General Retail Goods',
        O: 'Ambient Goods',
        P: 'THE RANGE / RMS-GB-000252-003 / DN8 4HT',
        Q: 'CDS attestation text'
      }
    ]
  }
}
