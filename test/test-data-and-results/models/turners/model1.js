export default {
  validModel: {
    PackingList_Extract: [
      {
        A: 'Description of Goods',
        B: 'Commodity code',
        C: 'No. of pkgs',
        D: 'Item Net Weight kg',
        E: 'Nature of Product',
        F: 'Type of Treatment',
        G: 'Country of Origin',
        H: 'NIRMS / NON NIRMS'
      },
      {
        A: 'Fresh Beef Mince',
        B: '02013000',
        C: '10',
        D: '50.5',
        E: 'Meat Products',
        F: 'Chilled',
        G: 'IE',
        H: 'NIRMS',
        I: 'RMS-GB-000156-001'
      },
      {
        A: 'Fresh Lamb Steaks',
        B: '02041000',
        C: '5',
        D: '25.2',
        E: 'Meat Products',
        F: 'Chilled',
        G: 'IE',
        H: 'NIRMS',
        I: 'RMS-GB-000156-001'
      }
    ]
  },
  validHeadersNoData: {
    PackingList_Extract: [
      {
        I: 'RMS-GB-000156-001'
      },
      {
        A: 'Description of Goods',
        B: 'Commodity code',
        C: 'No. of pkgs',
        D: 'Item Net Weight',
        E: 'Nature of Product',
        F: 'Type of Treatment',
        G: 'Country of Origin',
        H: 'NIRMS / NON NIRMS'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {
        A: 'Description of Goods',
        B: 'Commodity code',
        C: 'No. of pkgs',
        D: 'Item Net Weight kg',
        E: 'Nature of Product',
        F: 'Type of Treatment',
        G: 'Country of Origin',
        H: 'NIRMS / NON NIRMS'
      },
      {
        A: 'Fresh Beef Mince',
        B: '02013000',
        C: '10',
        D: '50.5',
        E: 'Meat Products',
        F: 'Chilled',
        G: 'IE',
        H: 'NON-NIRMS',
        I: 'RMS-GB-000156-001'
      }
    ],
    Sheet2: [
      {
        A: 'Description of Goods',
        B: 'Commodity code',
        C: 'No. of pkgs',
        D: 'Item Net Weight kg',
        E: 'Nature of Product',
        F: 'Type of Treatment',
        G: 'Country of Origin',
        H: 'NIRMS / NON NIRMS'
      },
      {
        A: 'Fresh Lamb Steaks',
        B: '02041000',
        C: '5',
        D: '25.2',
        E: 'Meat Products',
        F: 'Chilled',
        G: 'IE',
        H: 'NON-NIRMS',
        I: 'RMS-GB-000156-001'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    PackingList_Extract: [
      {
        A: 'Description of Goods',
        B: 'Commodity code',
        C: 'No. of pkgs',
        D: 'Item Net Weight kg',
        E: 'Nature of Product',
        F: 'Type of Treatment',
        G: 'Country of Origin',
        H: 'NIRMS / NON NIRMS'
      },
      {
        A: null,
        B: '02013000',
        C: '10',
        D: '50.5',
        E: 'Meat Products',
        F: 'Chilled',
        G: 'IE',
        H: 'NON-NIRMS',
        I: 'RMS-GB-000156-001'
      }
    ]
  }
}
