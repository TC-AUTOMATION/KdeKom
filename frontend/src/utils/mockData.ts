import { Invoice } from '../types/invoice';

export const mockInvoices: Invoice[] = [
  // Juillet 2025
  {
    id: '2025-00001',
    date: '2025-07-05',
    dueDate: '2025-07-20',
    paymentMethod: 'Virement bancaire',
    status: 'paid',
    client: {
      name: 'Garage Martin',
      address: '15 Rue de la République',
      postalCode: '75001',
      city: 'Paris',
      email: 'contact@garagemartin.fr',
      phone: '01 23 45 67 89',
      type: 'b2b'
    },
    items: [
      {
        id: '1',
        description: 'Lavage extérieur complet',
        vehicleInfo: 'Renault Clio - AB-123-CD',
        quantity: 1,
        unitPrice: 45,
        taxRate: 20,
        discount: 0
      },
      {
        id: '2',
        description: 'Polissage carrosserie',
        vehicleInfo: 'Renault Clio - AB-123-CD',
        quantity: 1,
        unitPrice: 120,
        taxRate: 20,
        discount: 0
      }
    ],
    notes: 'Merci pour votre confiance',
    company: {
      name: 'LustrAuto',
      companyName: 'LustrAuto',
      owner: 'Jean Dupont',
      address: '10 Avenue des Garages',
      postalCode: '75015',
      city: 'Paris',
      phone: '01 98 76 54 32',
      email: 'contact@lustrauto.fr',
      siret: '123 456 789 00012'
    },
    total: 198
  },
  {
    id: '2025-00002',
    date: '2025-07-12',
    dueDate: '2025-07-27',
    paymentMethod: 'Espèces',
    status: 'paid',
    client: {
      name: 'Auto Service Plus',
      address: '28 Boulevard Voltaire',
      postalCode: '75011',
      city: 'Paris',
      email: 'contact@autoserviceplus.fr',
      phone: '01 34 56 78 90',
      type: 'b2b'
    },
    items: [
      {
        id: '1',
        description: 'Nettoyage intérieur complet',
        vehicleInfo: 'Peugeot 308 - EF-456-GH',
        quantity: 1,
        unitPrice: 85,
        taxRate: 20,
        discount: 0
      }
    ],
    notes: '',
    company: {
      name: 'LustrAuto',
      companyName: 'LustrAuto',
      owner: 'Jean Dupont',
      address: '10 Avenue des Garages',
      postalCode: '75015',
      city: 'Paris',
      phone: '01 98 76 54 32',
      email: 'contact@lustrauto.fr',
      siret: '123 456 789 00012'
    },
    total: 102
  },

  // Août 2025
  {
    id: '2025-00003',
    date: '2025-08-03',
    dueDate: '2025-08-18',
    paymentMethod: 'Carte bancaire',
    status: 'paid',
    client: {
      name: 'Mécanique Express',
      address: '42 Rue du Commerce',
      postalCode: '69001',
      city: 'Lyon',
      email: 'contact@mecaniqueexpress.fr',
      phone: '04 12 34 56 78',
      type: 'b2b'
    },
    items: [
      {
        id: '1',
        description: 'Rénovation phares',
        vehicleInfo: 'BMW Série 3 - IJ-789-KL',
        quantity: 2,
        unitPrice: 55,
        taxRate: 20,
        discount: 10
      }
    ],
    notes: 'Client fidèle - 10% de remise',
    company: {
      name: 'LustrAuto',
      companyName: 'LustrAuto',
      owner: 'Jean Dupont',
      address: '10 Avenue des Garages',
      postalCode: '75015',
      city: 'Paris',
      phone: '01 98 76 54 32',
      email: 'contact@lustrauto.fr',
      siret: '123 456 789 00012'
    },
    total: 118.8
  },

  // Septembre 2025 - Plusieurs factures
  {
    id: '2025-00004',
    date: '2025-09-08',
    dueDate: '2025-09-23',
    paymentMethod: 'Virement bancaire',
    status: 'paid',
    client: {
      name: 'Garage Martin',
      address: '15 Rue de la République',
      postalCode: '75001',
      city: 'Paris',
      email: 'contact@garagemartin.fr',
      phone: '01 23 45 67 89',
      type: 'b2b'
    },
    items: [
      {
        id: '1',
        description: 'Lavage premium + cire',
        vehicleInfo: 'Mercedes Classe E - MN-012-OP',
        quantity: 1,
        unitPrice: 180,
        taxRate: 20,
        discount: 0
      },
      {
        id: '2',
        description: 'Traitement céramique',
        vehicleInfo: 'Mercedes Classe E - MN-012-OP',
        quantity: 1,
        unitPrice: 450,
        taxRate: 20,
        discount: 0
      }
    ],
    notes: 'Prestation premium',
    company: {
      name: 'LustrAuto',
      companyName: 'LustrAuto',
      owner: 'Jean Dupont',
      address: '10 Avenue des Garages',
      postalCode: '75015',
      city: 'Paris',
      phone: '01 98 76 54 32',
      email: 'contact@lustrauto.fr',
      siret: '123 456 789 00012'
    },
    total: 756
  },
  {
    id: '2025-00005',
    date: '2025-09-15',
    dueDate: '2025-09-30',
    paymentMethod: 'Espèces',
    status: 'paid',
    client: {
      name: 'Auto Prestige',
      address: '7 Place de la Mairie',
      postalCode: '92100',
      city: 'Boulogne-Billancourt',
      email: 'contact@autoprestige.fr',
      phone: '01 45 67 89 01',
      type: 'b2c'
    },
    items: [
      {
        id: '1',
        description: 'Polissage carrosserie complète',
        vehicleInfo: 'Audi A4 - QR-345-ST',
        quantity: 1,
        unitPrice: 250,
        taxRate: 20,
        discount: 0
      }
    ],
    notes: '',
    company: {
      name: 'LustrAuto',
      companyName: 'LustrAuto',
      owner: 'Jean Dupont',
      address: '10 Avenue des Garages',
      postalCode: '75015',
      city: 'Paris',
      phone: '01 98 76 54 32',
      email: 'contact@lustrauto.fr',
      siret: '123 456 789 00012'
    },
    total: 300
  },
  {
    id: '2025-00006',
    date: '2025-09-22',
    dueDate: '2025-10-07',
    paymentMethod: 'Virement bancaire',
    status: 'paid',
    client: {
      name: 'Société TransAuto',
      address: '33 Avenue Jean Jaurès',
      postalCode: '93100',
      city: 'Montreuil',
      email: 'facturation@transauto.fr',
      phone: '01 56 78 90 12',
      type: 'b2b'
    },
    items: [
      {
        id: '1',
        description: 'Nettoyage flotte (5 véhicules)',
        vehicleInfo: 'Véhicules utilitaires',
        quantity: 5,
        unitPrice: 65,
        taxRate: 20,
        discount: 15
      }
    ],
    notes: 'Contrat entreprise - 15% de remise',
    company: {
      name: 'LustrAuto',
      companyName: 'LustrAuto',
      owner: 'Jean Dupont',
      address: '10 Avenue des Garages',
      postalCode: '75015',
      city: 'Paris',
      phone: '01 98 76 54 32',
      email: 'contact@lustrauto.fr',
      siret: '123 456 789 00012'
    },
    total: 331.5
  },

  // Octobre 2025
  {
    id: '2025-00007',
    date: '2025-10-10',
    dueDate: '2025-10-25',
    paymentMethod: 'Carte bancaire',
    status: 'sent',
    client: {
      name: 'Auto Service Plus',
      address: '28 Boulevard Voltaire',
      postalCode: '75011',
      city: 'Paris',
      email: 'contact@autoserviceplus.fr',
      phone: '01 34 56 78 90',
      type: 'b2b'
    },
    items: [
      {
        id: '1',
        description: 'Lustrage carrosserie',
        vehicleInfo: 'Volkswagen Golf - UV-678-WX',
        quantity: 1,
        unitPrice: 95,
        taxRate: 20,
        discount: 0
      }
    ],
    notes: 'Paiement en attente',
    company: {
      name: 'LustrAuto',
      companyName: 'LustrAuto',
      owner: 'Jean Dupont',
      address: '10 Avenue des Garages',
      postalCode: '75015',
      city: 'Paris',
      phone: '01 98 76 54 32',
      email: 'contact@lustrauto.fr',
      siret: '123 456 789 00012'
    },
    total: 114
  },

  // Novembre 2025
  {
    id: '2025-00008',
    date: '2025-11-05',
    dueDate: '2025-11-20',
    paymentMethod: 'Virement bancaire',
    status: 'sent',
    client: {
      name: 'Garage Martin',
      address: '15 Rue de la République',
      postalCode: '75001',
      city: 'Paris',
      email: 'contact@garagemartin.fr',
      phone: '01 23 45 67 89',
      type: 'b2b'
    },
    items: [
      {
        id: '1',
        description: 'Nettoyage intérieur + extérieur',
        vehicleInfo: 'Tesla Model 3 - YZ-901-AB',
        quantity: 1,
        unitPrice: 135,
        taxRate: 20,
        discount: 0
      }
    ],
    notes: '',
    company: {
      name: 'LustrAuto',
      companyName: 'LustrAuto',
      owner: 'Jean Dupont',
      address: '10 Avenue des Garages',
      postalCode: '75015',
      city: 'Paris',
      phone: '01 98 76 54 32',
      email: 'contact@lustrauto.fr',
      siret: '123 456 789 00012'
    },
    total: 162
  },

  // Décembre 2025
  {
    id: '2025-00009',
    date: '2025-12-12',
    dueDate: '2025-12-27',
    paymentMethod: 'Espèces',
    status: 'sent',
    client: {
      name: 'Mécanique Express',
      address: '42 Rue du Commerce',
      postalCode: '69001',
      city: 'Lyon',
      email: 'contact@mecaniqueexpress.fr',
      phone: '04 12 34 56 78',
      type: 'b2b'
    },
    items: [
      {
        id: '1',
        description: 'Rénovation intérieur cuir',
        vehicleInfo: 'Porsche Cayenne - CD-234-EF',
        quantity: 1,
        unitPrice: 280,
        taxRate: 20,
        discount: 0
      }
    ],
    notes: 'Prestation haut de gamme',
    company: {
      name: 'LustrAuto',
      companyName: 'LustrAuto',
      owner: 'Jean Dupont',
      address: '10 Avenue des Garages',
      postalCode: '75015',
      city: 'Paris',
      phone: '01 98 76 54 32',
      email: 'contact@lustrauto.fr',
      siret: '123 456 789 00012'
    },
    total: 336
  },

  // Janvier 2026
  {
    id: '2026-00010',
    date: '2026-01-08',
    dueDate: '2026-01-23',
    paymentMethod: 'Carte bancaire',
    status: 'draft',
    client: {
      name: 'Auto Prestige',
      address: '7 Place de la Mairie',
      postalCode: '92100',
      city: 'Boulogne-Billancourt',
      email: 'contact@autoprestige.fr',
      phone: '01 45 67 89 01',
      type: 'b2c'
    },
    items: [
      {
        id: '1',
        description: 'Traitement anti-pluie pare-brise',
        vehicleInfo: 'Range Rover - GH-567-IJ',
        quantity: 1,
        unitPrice: 75,
        taxRate: 20,
        discount: 0
      }
    ],
    notes: 'Brouillon à envoyer',
    company: {
      name: 'LustrAuto',
      companyName: 'LustrAuto',
      owner: 'Jean Dupont',
      address: '10 Avenue des Garages',
      postalCode: '75015',
      city: 'Paris',
      phone: '01 98 76 54 32',
      email: 'contact@lustrauto.fr',
      siret: '123 456 789 00012'
    },
    total: 90
  },

  // Février 2026
  {
    id: '2026-00011',
    date: '2026-02-14',
    dueDate: '2026-03-01',
    paymentMethod: 'Virement bancaire',
    status: 'draft',
    client: {
      name: 'Société TransAuto',
      address: '33 Avenue Jean Jaurès',
      postalCode: '93100',
      city: 'Montreuil',
      email: 'facturation@transauto.fr',
      phone: '01 56 78 90 12',
      type: 'b2b'
    },
    items: [
      {
        id: '1',
        description: 'Maintenance mensuelle flotte',
        vehicleInfo: 'Flotte 10 véhicules',
        quantity: 10,
        unitPrice: 55,
        taxRate: 20,
        discount: 20
      }
    ],
    notes: 'Contrat mensuel',
    company: {
      name: 'LustrAuto',
      companyName: 'LustrAuto',
      owner: 'Jean Dupont',
      address: '10 Avenue des Garages',
      postalCode: '75015',
      city: 'Paris',
      phone: '01 98 76 54 32',
      email: 'contact@lustrauto.fr',
      siret: '123 456 789 00012'
    },
    total: 528
  }
];
