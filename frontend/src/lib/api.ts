import data from './data.json';

// Types
export interface Apporteur {
  id: string;
  nom: string;
  note?: string;
}

export interface Client {
  id: string;
  nom: string;
  note?: string;
}

export interface Collaborateur {
  id: string;
  nom: string;
  note?: string;
}

export interface PartCollaborateur {
  collaborateur: string;
  pct: number | null;
  montant: number | null;
}

export interface Mission {
  id: string;
  apporteur: string | null;
  client: string;
  nom_mission: string;
  mois: string;
  annee: number;
  // Facturation totale
  ca_genere: number | null;           // Montant total facturé pour la mission
  // Double financement: Subvention + Client
  pct_sub: number | null;             // % financé par subvention (OPCO, organisme, etc.)
  pct_client: number | null;          // % financé par le client direct
  montant_sub: number | null;         // Montant subvention = CA × pct_sub%
  montant_client: number | null;      // Montant payé par client (0 si impayé)
  // Calculs de distribution
  reduction_base: number | null;
  base_distribuable: number | null;   // Base pour répartition (montant_client - réduction)
  provision_charges: number | null;   // Mis de côté pour charges fixes
  frais_supp_fred: number | null;     // Frais Fred (souvent = provision_charges)
  frais_gestion: number | null;       // Frais de structure KDECOM
  frais_ml: number | null;            // Commission ML
  frais_lt: number | null;            // Commission LT
  restant_apres_frais: number | null;
  commission_apporteur: number | null;
  restant_apres_apporteur: number | null;
  pct_reliquat: number | null;
  parts_collaborateurs: PartCollaborateur[];
  reliquat_final: number | null;
}

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory data (mutable copies)
let missions: Mission[] = [...data.missions];
let clients: Client[] = [...data.clients];
let apporteurs: Apporteur[] = [...data.apporteurs];
let collaborateurs: Collaborateur[] = [...data.collaborateurs];

// Helper: get name by id
const getApporteurNom = (id: string | null): string => {
  if (!id) return '-';
  const a = apporteurs.find(a => a.id === id);
  return a ? a.nom : id;
};

const getClientNom = (id: string): string => {
  const c = clients.find(c => c.id === id);
  return c ? c.nom : id;
};

const getCollaborateurNom = (id: string): string => {
  const c = collaborateurs.find(c => c.id === id);
  return c ? c.nom : id;
};

// Mois order for sorting
const moisOrder: Record<string, number> = {
  'Janvier': 1, 'Février': 2, 'Mars': 3, 'Avril': 4, 'Mai': 5, 'Juin': 6,
  'Juillet': 7, 'Août': 8, 'Septembre': 9, 'Octobre': 10, 'Novembre': 11, 'Décembre': 12
};

// ============ MISSIONS ============
export const fetchMissions = async () => {
  await delay(200);
  return missions.map(m => ({
    ...m,
    apporteur_nom: getApporteurNom(m.apporteur),
    client_nom: getClientNom(m.client),
    // Computed: client a payé si montant_client > 0
    is_paid: (m.montant_client || 0) > 0,
    // Total encaissé = subvention + client
    total_encaisse: (m.montant_sub || 0) + (m.montant_client || 0),
    // Montant en attente (si client n'a pas payé)
    montant_attendu: (m.montant_client || 0) === 0 ? (m.ca_genere || 0) * (m.pct_client || 0) / 100 : 0,
    // For sorting
    mois_ordre: moisOrder[m.mois] || 0,
  }));
};

export const getMission = async (id: string) => {
  await delay(100);
  const m = missions.find(m => m.id === id);
  if (!m) return null;
  return {
    ...m,
    apporteur_nom: getApporteurNom(m.apporteur),
    client_nom: getClientNom(m.client),
    is_paid: (m.montant_client || 0) > 0,
  };
};

export const createMission = async (mission: Partial<Mission>) => {
  await delay(200);
  const newId = `M${String(missions.length + 1).padStart(3, '0')}`;
  const newMission: Mission = {
    id: newId,
    apporteur: mission.apporteur || null,
    client: mission.client || '',
    nom_mission: mission.nom_mission || '',
    mois: mission.mois || '',
    annee: mission.annee || new Date().getFullYear(),
    ca_genere: mission.ca_genere || null,
    pct_sub: mission.pct_sub || null,
    pct_client: mission.pct_client || null,
    montant_sub: mission.montant_sub || null,
    montant_client: mission.montant_client || null,
    reduction_base: mission.reduction_base || null,
    base_distribuable: mission.base_distribuable || null,
    provision_charges: mission.provision_charges || null,
    frais_supp_fred: mission.frais_supp_fred || null,
    frais_gestion: mission.frais_gestion || null,
    frais_ml: mission.frais_ml || null,
    frais_lt: mission.frais_lt || null,
    restant_apres_frais: mission.restant_apres_frais || null,
    commission_apporteur: mission.commission_apporteur || 0,
    restant_apres_apporteur: mission.restant_apres_apporteur || null,
    pct_reliquat: mission.pct_reliquat || null,
    parts_collaborateurs: mission.parts_collaborateurs || [
      { collaborateur: 'fred', pct: null, montant: null },
      { collaborateur: 'eric', pct: null, montant: null },
      { collaborateur: 'boom', pct: null, montant: null },
      { collaborateur: 'damien', pct: null, montant: null },
      { collaborateur: 'maitre', pct: null, montant: null },
    ],
    reliquat_final: mission.reliquat_final || null,
  };
  missions.push(newMission);
  return newMission;
};

export const updateMission = async (id: string, updates: Partial<Mission>) => {
  await delay(200);
  const index = missions.findIndex(m => m.id === id);
  if (index === -1) return null;
  missions[index] = { ...missions[index], ...updates };
  return missions[index];
};

export const deleteMission = async (id: string) => {
  await delay(200);
  const index = missions.findIndex(m => m.id === id);
  if (index === -1) return false;
  missions.splice(index, 1);
  return true;
};

export const createMissionsBulk = async (missionsData: Partial<Mission>[]): Promise<Mission[]> => {
  await delay(200);
  const createdMissions: Mission[] = [];

  for (const mission of missionsData) {
    const newId = `M${String(missions.length + 1).padStart(3, '0')}`;
    const newMission: Mission = {
      id: newId,
      apporteur: mission.apporteur || null,
      client: mission.client || '',
      nom_mission: mission.nom_mission || '',
      mois: mission.mois || '',
      annee: mission.annee || new Date().getFullYear(),
      ca_genere: mission.ca_genere || null,
      pct_sub: mission.pct_sub || null,
      pct_client: mission.pct_client || null,
      montant_sub: mission.montant_sub || null,
      montant_client: mission.montant_client || null,
      reduction_base: mission.reduction_base || null,
      base_distribuable: mission.base_distribuable || null,
      provision_charges: mission.provision_charges || null,
      frais_supp_fred: mission.frais_supp_fred || null,
      frais_gestion: mission.frais_gestion || null,
      frais_ml: mission.frais_ml || null,
      frais_lt: mission.frais_lt || null,
      restant_apres_frais: mission.restant_apres_frais || null,
      commission_apporteur: mission.commission_apporteur || 0,
      restant_apres_apporteur: mission.restant_apres_apporteur || null,
      pct_reliquat: mission.pct_reliquat || null,
      parts_collaborateurs: mission.parts_collaborateurs || [
        { collaborateur: 'fred', pct: null, montant: null },
        { collaborateur: 'eric', pct: null, montant: null },
        { collaborateur: 'boom', pct: null, montant: null },
        { collaborateur: 'damien', pct: null, montant: null },
        { collaborateur: 'maitre', pct: null, montant: null },
      ],
      reliquat_final: mission.reliquat_final || null,
    };
    missions.push(newMission);
    createdMissions.push(newMission);
  }

  return createdMissions;
};

export const toggleMissionPaid = async (id: string) => {
  await delay(100);
  const mission = missions.find(m => m.id === id);
  if (!mission) return null;
  // Toggle: if paid, set to 0; if not paid, set to montant_sub
  if ((mission.montant_client || 0) > 0) {
    mission.montant_client = 0;
    mission.base_distribuable = 0;
    mission.restant_apres_frais = 0;
    mission.restant_apres_apporteur = 0;
  } else {
    mission.montant_client = mission.montant_sub;
    mission.base_distribuable = mission.montant_sub;
    mission.restant_apres_frais = mission.montant_sub;
    mission.restant_apres_apporteur = mission.montant_sub;
  }
  return mission;
};

// ============ CLIENTS ============
export const fetchClients = async () => {
  await delay(200);
  // Enrich with stats
  return clients.map(c => {
    const clientMissions = missions.filter(m => m.client === c.id);
    const totalCA = clientMissions.reduce((sum, m) => sum + (m.ca_genere || 0), 0);
    const totalSubvention = clientMissions.reduce((sum, m) => sum + (m.montant_sub || 0), 0);
    const totalPaye = clientMissions.reduce((sum, m) => sum + (m.montant_client || 0), 0);
    const nbMissions = clientMissions.length;
    return {
      ...c,
      nb_missions: nbMissions,
      ca_total: totalCA,
      total_subvention: totalSubvention,
      total_paye: totalPaye,
    };
  });
};

export const getClient = async (id: string) => {
  await delay(100);
  const c = clients.find(c => c.id === id);
  if (!c) return null;
  const clientMissions = missions.filter(m => m.client === c.id);
  return {
    ...c,
    missions: clientMissions,
    nb_missions: clientMissions.length,
    ca_total: clientMissions.reduce((sum, m) => sum + (m.ca_genere || 0), 0),
    total_paye: clientMissions.reduce((sum, m) => sum + (m.montant_client || 0), 0),
  };
};

export const createClient = async (client: Partial<Client>) => {
  await delay(200);
  const newClient: Client = {
    id: client.id || client.nom?.toLowerCase().replace(/\s+/g, '_') || '',
    nom: client.nom || '',
    note: client.note,
  };
  clients.push(newClient);
  return newClient;
};

export const updateClient = async (id: string, updates: Partial<Client>) => {
  await delay(200);
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) return null;
  clients[index] = { ...clients[index], ...updates };
  return clients[index];
};

export const deleteClient = async (id: string) => {
  await delay(200);
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) return false;
  clients.splice(index, 1);
  return true;
};

// ============ APPORTEURS ============
export const fetchApporteurs = async () => {
  await delay(200);
  return apporteurs.map(a => {
    const apporteurMissions = missions.filter(m => m.apporteur === a.id);
    const totalCommissions = apporteurMissions.reduce((sum, m) => sum + (m.commission_apporteur || 0), 0);
    const nbMissions = apporteurMissions.length;
    return {
      ...a,
      nb_missions: nbMissions,
      total_commissions: totalCommissions,
    };
  });
};

export const getApporteur = async (id: string) => {
  await delay(100);
  const a = apporteurs.find(a => a.id === id);
  if (!a) return null;
  const apporteurMissions = missions.filter(m => m.apporteur === a.id);
  return {
    ...a,
    missions: apporteurMissions.map(m => ({
      ...m,
      client_nom: getClientNom(m.client),
    })),
    nb_missions: apporteurMissions.length,
    total_commissions: apporteurMissions.reduce((sum, m) => sum + (m.commission_apporteur || 0), 0),
  };
};

export const createApporteur = async (apporteur: Partial<Apporteur>) => {
  await delay(200);
  const newApporteur: Apporteur = {
    id: apporteur.id || apporteur.nom?.toLowerCase().replace(/\s+/g, '_') || '',
    nom: apporteur.nom || '',
    note: apporteur.note,
  };
  apporteurs.push(newApporteur);
  return newApporteur;
};

// ============ COLLABORATEURS ============
export const fetchCollaborateurs = async () => {
  await delay(200);
  return collaborateurs.map(c => {
    // Calculate total earnings for this collaborateur
    let totalGains = 0;
    let totalPotentiel = 0;
    missions.forEach(m => {
      const part = m.parts_collaborateurs.find(p => p.collaborateur === c.id);
      if (part) {
        totalGains += part.montant || 0;
        // Potentiel = what they would get if everything was paid
        if (part.pct && m.restant_apres_apporteur) {
          totalPotentiel += (part.pct / 100) * m.restant_apres_apporteur;
        }
      }
    });
    return {
      ...c,
      total_gains: totalGains,
      total_potentiel: totalPotentiel,
    };
  });
};

export const getCollaborateur = async (id: string) => {
  await delay(100);
  const c = collaborateurs.find(c => c.id === id);
  if (!c) return null;

  // Get all missions where this collaborateur has a part
  const collabMissions = missions.filter(m =>
    m.parts_collaborateurs.some(p => p.collaborateur === c.id && (p.pct || p.montant))
  ).map(m => {
    const part = m.parts_collaborateurs.find(p => p.collaborateur === c.id);
    return {
      ...m,
      client_nom: getClientNom(m.client),
      apporteur_nom: getApporteurNom(m.apporteur),
      part_pct: part?.pct,
      part_montant: part?.montant,
    };
  });

  return {
    ...c,
    missions: collabMissions,
    total_gains: collabMissions.reduce((sum, m) => sum + (m.part_montant || 0), 0),
  };
};

// ============ DASHBOARD / STATS ============
export const fetchDashboardStats = async () => {
  await delay(200);

  // Totaux avec modèle double financement (Subvention + Client)
  const totalCA = missions.reduce((sum, m) => sum + (m.ca_genere || 0), 0);
  const totalSubvention = missions.reduce((sum, m) => sum + (m.montant_sub || 0), 0);
  const totalClient = missions.reduce((sum, m) => sum + (m.montant_client || 0), 0);
  const totalEncaisse = totalSubvention + totalClient;

  // Montant en attente = missions impayées (client n'a pas payé sa part)
  const totalEnAttente = missions
    .filter(m => (m.montant_client || 0) === 0)
    .reduce((sum, m) => sum + ((m.ca_genere || 0) * (m.pct_client || 0) / 100), 0);

  const totalReliquat = missions.reduce((sum, m) => sum + (m.reliquat_final || 0), 0);
  const totalCommissions = missions.reduce((sum, m) => {
    const partCollab = m.parts_collaborateurs.reduce((s, p) => s + (p.montant || 0), 0);
    return sum + partCollab + (m.commission_apporteur || 0);
  }, 0);

  // By month
  const byMonth: Record<string, {
    ca: number;
    subvention: number;
    client: number;
    encaisse: number;
    en_attente: number;
    commissions: number;
    commissions_apporteurs: number;
    commissions_collaborateurs: number;
    commissions_par_collaborateur: Record<string, number>;
    commissions_par_apporteur: Record<string, number>;
    missions: number;
  }> = {};

  missions.forEach(m => {
    const key = `${m.annee}-${String(moisOrder[m.mois] || 0).padStart(2, '0')}`;
    if (!byMonth[key]) {
      byMonth[key] = { ca: 0, subvention: 0, client: 0, encaisse: 0, en_attente: 0, commissions: 0, commissions_apporteurs: 0, commissions_collaborateurs: 0, commissions_par_collaborateur: {}, commissions_par_apporteur: {}, missions: 0 };
    }
    byMonth[key].ca += m.ca_genere || 0;
    byMonth[key].subvention += m.montant_sub || 0;
    byMonth[key].client += m.montant_client || 0;
    byMonth[key].encaisse += (m.montant_sub || 0) + (m.montant_client || 0);

    // Si client n'a pas payé, c'est en attente
    if ((m.montant_client || 0) === 0) {
      byMonth[key].en_attente += (m.ca_genere || 0) * (m.pct_client || 0) / 100;
    }

    // Commissions séparées: apporteurs vs collaborateurs
    let partCollab = 0;
    m.parts_collaborateurs.forEach(p => {
      const montant = p.montant || 0;
      partCollab += montant;
      const collabNom = getCollaborateurNom(p.collaborateur);
      byMonth[key].commissions_par_collaborateur[collabNom] = (byMonth[key].commissions_par_collaborateur[collabNom] || 0) + montant;
    });
    const partApporteur = m.commission_apporteur || 0;
    if (partApporteur > 0 && m.apporteur) {
      const apporteurNom = getApporteurNom(m.apporteur);
      byMonth[key].commissions_par_apporteur[apporteurNom] = (byMonth[key].commissions_par_apporteur[apporteurNom] || 0) + partApporteur;
    }
    byMonth[key].commissions_collaborateurs += partCollab;
    byMonth[key].commissions_apporteurs += partApporteur;
    byMonth[key].commissions += partCollab + partApporteur;
    byMonth[key].missions += 1;
  });

  // By client (top 10)
  const byClient: Record<string, number> = {};
  missions.forEach(m => {
    const clientNom = getClientNom(m.client);
    byClient[clientNom] = (byClient[clientNom] || 0) + (m.ca_genere || 0);
  });
  const topClients = Object.entries(byClient)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([nom, ca]) => ({ nom, ca }));

  // By collaborateur
  const byCollab: Record<string, number> = {};
  collaborateurs.forEach(c => {
    byCollab[c.nom] = 0;
  });
  missions.forEach(m => {
    m.parts_collaborateurs.forEach(p => {
      const collabNom = getCollaborateurNom(p.collaborateur);
      byCollab[collabNom] = (byCollab[collabNom] || 0) + (p.montant || 0);
    });
  });

  return {
    totals: {
      ca_total: totalCA,
      total_subvention: totalSubvention,
      total_client: totalClient,
      total_encaisse: totalEncaisse,
      total_en_attente: totalEnAttente,
      total_commissions: totalCommissions,
      total_reliquat: totalReliquat,
      nb_missions: missions.length,
      nb_missions_payees: missions.filter(m => (m.montant_client || 0) > 0).length,
      nb_missions_impayees: missions.filter(m => (m.montant_client || 0) === 0).length,
      nb_clients: clients.length,
      nb_apporteurs: apporteurs.length,
      taux_paiement: totalCA > 0 ? Math.round((totalEncaisse / totalCA) * 100) : 0,
    },
    byMonth: Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mois, data]) => ({ mois, ...data })),
    topClients,
    byCollaborateur: Object.entries(byCollab).map(([nom, total]) => ({ nom, total })),
  };
};

// ============ RECAP MENSUEL ============
export const fetchRecapMensuel = async (annee: number, mois: string) => {
  await delay(200);

  const monthMissions = missions.filter(m => m.annee === annee && m.mois === mois);

  const totalCA = monthMissions.reduce((sum, m) => sum + (m.ca_genere || 0), 0);
  const totalPaye = monthMissions.reduce((sum, m) => sum + (m.montant_client || 0), 0);
  const totalReliquat = monthMissions.reduce((sum, m) => sum + (m.reliquat_final || 0), 0);

  // Parts par collaborateur
  const partsCollab: Record<string, number> = {};
  monthMissions.forEach(m => {
    m.parts_collaborateurs.forEach(p => {
      const nom = getCollaborateurNom(p.collaborateur);
      partsCollab[nom] = (partsCollab[nom] || 0) + (p.montant || 0);
    });
  });

  return {
    annee,
    mois,
    nb_missions: monthMissions.length,
    ca_total: totalCA,
    total_paye: totalPaye,
    total_impaye: totalCA - totalPaye,
    total_reliquat: totalReliquat,
    missions: monthMissions.map(m => ({
      ...m,
      client_nom: getClientNom(m.client),
      apporteur_nom: getApporteurNom(m.apporteur),
    })),
    parts_collaborateurs: Object.entries(partsCollab).map(([nom, montant]) => ({ nom, montant })),
  };
};

// ============ CHARGES ============
export interface Charge {
  id: string;
  nom: string;
  montant_mensuel: number;
  montant_annuel: number;
  categorie: 'fixe' | 'provision';
  type: 'mensuelle' | 'ponctuelle';
  mois?: string;  // For ponctuelle charges
  annee?: number; // For ponctuelle charges
  description?: string;
}

// Fixed monthly charges
const chargesFixes: Charge[] = [
  { id: 'ch001', nom: 'Compta Kdekom', montant_mensuel: 92.00, montant_annuel: 1104.00, categorie: 'fixe', type: 'mensuelle' },
  { id: 'ch002', nom: 'Dom', montant_mensuel: 60.00, montant_annuel: 720.00, categorie: 'fixe', type: 'mensuelle' },
  { id: 'ch003', nom: 'Téléphone', montant_mensuel: 9.00, montant_annuel: 108.00, categorie: 'fixe', type: 'mensuelle' },
  { id: 'ch004', nom: 'Quickbooks', montant_mensuel: 15.00, montant_annuel: 180.00, categorie: 'fixe', type: 'mensuelle' },
  { id: 'ch005', nom: 'Wize', montant_mensuel: 4.20, montant_annuel: 50.40, categorie: 'fixe', type: 'mensuelle' },
  { id: 'ch006', nom: 'Google', montant_mensuel: 7.50, montant_annuel: 90.00, categorie: 'fixe', type: 'mensuelle' },
  { id: 'ch007', nom: 'Amazon', montant_mensuel: 8.00, montant_annuel: 96.00, categorie: 'fixe', type: 'mensuelle' },
];

export interface ChargeProvision {
  mission_id: string;
  mission_nom: string;
  client_nom: string;
  mois: string;
  annee: number;
  montant: number;
}

export interface ChargesMensuelles {
  mois: string;
  annee: number;
  charges_fixes: number;
  provision: number;
  total: number;
}

export const fetchCharges = async () => {
  await delay(200);
  return chargesFixes;
};

export const createCharge = async (charge: Omit<Charge, 'id'>): Promise<Charge> => {
  await delay(200);
  const newCharge: Charge = {
    ...charge,
    id: `ch${String(chargesFixes.length + 1).padStart(3, '0')}`,
  };
  chargesFixes.push(newCharge);
  return newCharge;
};

export const updateCharge = async (id: string, updates: Partial<Omit<Charge, 'id'>>): Promise<Charge | null> => {
  await delay(200);
  const index = chargesFixes.findIndex(c => c.id === id);
  if (index === -1) return null;
  chargesFixes[index] = { ...chargesFixes[index], ...updates };
  return chargesFixes[index];
};

export const deleteCharge = async (id: string): Promise<boolean> => {
  await delay(200);
  const index = chargesFixes.findIndex(c => c.id === id);
  if (index === -1) return false;
  chargesFixes.splice(index, 1);
  return true;
};

export const fetchChargesProvision = async () => {
  await delay(200);
  // Extract provision_charges from missions
  return missions
    .filter(m => m.provision_charges && m.provision_charges > 0)
    .map(m => ({
      mission_id: m.id,
      mission_nom: m.nom_mission,
      client_nom: getClientNom(m.client),
      mois: m.mois,
      annee: m.annee,
      montant: m.provision_charges || 0,
    }));
};

export interface ChargesMensuellesExtended extends ChargesMensuelles {
  provision_cumul: number;
  charges_cumul: number;
  reliquat: number;
}

export const fetchChargesStats = async () => {
  await delay(200);

  // Séparer les charges mensuelles (récurrentes) des charges ponctuelles
  const chargesMensuelles = chargesFixes.filter(c => c.type === 'mensuelle');
  const chargesPonctuelles = chargesFixes.filter(c => c.type === 'ponctuelle');

  // Total des charges mensuelles (récurrentes) par mois
  const totalChargesMensuelles = chargesMensuelles.reduce((sum, c) => sum + c.montant_mensuel, 0);

  // Total des charges ponctuelles (une seule fois)
  const totalChargesPonctuelles = chargesPonctuelles.reduce((sum, c) => sum + c.montant_mensuel, 0);

  // Pour affichage: total charges fixes = mensuelles uniquement (ce qui est payé chaque mois de base)
  const totalChargesFixes = totalChargesMensuelles;

  // Total annuel = (mensuelles × 12) + ponctuelles
  const totalChargesFixesAnnuel = (totalChargesMensuelles * 12) + totalChargesPonctuelles;

  // Provisions from missions
  const provisions = missions
    .filter(m => m.provision_charges && m.provision_charges > 0)
    .map(m => ({
      mission_id: m.id,
      mission_nom: m.nom_mission,
      client_nom: getClientNom(m.client),
      mois: m.mois,
      annee: m.annee,
      montant: m.provision_charges || 0,
    }));

  const totalProvision = provisions.reduce((sum, p) => sum + p.montant, 0);

  // By month - with cumulative tracking
  const byMonth: Record<string, ChargesMensuellesExtended> = {};

  // Get unique months from missions WITH provisions only
  const allMonths = new Set<string>();
  provisions.forEach(p => {
    const key = `${p.annee}-${String(moisOrder[p.mois] || 0).padStart(2, '0')}`;
    allMonths.add(key);
  });

  // Also include months with ponctuelle charges
  chargesPonctuelles.forEach(c => {
    if (c.mois && c.annee) {
      const key = `${c.annee}-${String(moisOrder[c.mois] || 0).padStart(2, '0')}`;
      allMonths.add(key);
    }
  });

  // Sort months chronologically
  const sortedMonths = Array.from(allMonths).sort();

  // Initialize all months with base monthly charges
  sortedMonths.forEach(key => {
    const [annee, moisNum] = key.split('-');
    const moisNom = Object.entries(moisOrder).find(([_, v]) => v === parseInt(moisNum))?.[0] || '';

    // Charges pour ce mois = mensuelles + ponctuelles de ce mois
    let chargesDuMois = totalChargesMensuelles;
    chargesPonctuelles.forEach(c => {
      if (c.mois === moisNom && c.annee === parseInt(annee)) {
        chargesDuMois += c.montant_mensuel;
      }
    });

    byMonth[key] = {
      mois: moisNom,
      annee: parseInt(annee),
      charges_fixes: chargesDuMois,
      provision: 0,
      total: chargesDuMois,
      provision_cumul: 0,
      charges_cumul: 0,
      reliquat: 0,
    };
  });

  // Add provisions to each month
  provisions.forEach(p => {
    const key = `${p.annee}-${String(moisOrder[p.mois] || 0).padStart(2, '0')}`;
    if (byMonth[key]) {
      byMonth[key].provision += p.montant;
    }
  });

  // Calculer le reliquat par mois depuis les missions (reliquat_final)
  const reliquatByMonth: Record<string, number> = {};
  missions.forEach(m => {
    const key = `${m.annee}-${String(moisOrder[m.mois] || 0).padStart(2, '0')}`;
    if (!reliquatByMonth[key]) reliquatByMonth[key] = 0;
    reliquatByMonth[key] += m.reliquat_final || 0;
  });

  // Calculate cumulative values and reliquat (from mission data)
  let provisionCumul = 0;
  let chargesCumul = 0;
  let reliquatCumul = 0;
  sortedMonths.forEach(key => {
    provisionCumul += byMonth[key].provision;
    chargesCumul += byMonth[key].charges_fixes;
    reliquatCumul += reliquatByMonth[key] || 0;
    byMonth[key].provision_cumul = provisionCumul;
    byMonth[key].charges_cumul = chargesCumul;
    byMonth[key].reliquat = reliquatCumul; // Reliquat cumulé depuis les missions
  });

  // Total charges consumed = sum of all monthly charges
  const nbMois = sortedMonths.length;
  const totalChargesConsommees = sortedMonths.reduce((sum, key) => sum + byMonth[key].charges_fixes, 0);

  // Reliquat global = somme des reliquat_final des missions
  const reliquatGlobal = missions.reduce((sum, m) => sum + (m.reliquat_final || 0), 0);

  return {
    chargesFixes,
    totalChargesFixes,
    totalChargesFixesAnnuel,
    provisions,
    totalProvision,
    totalChargesConsommees,
    reliquatGlobal,
    nbMois,
    byMonth: sortedMonths.map(key => byMonth[key]),
  };
};

// ============ EXPORT ============
export const exportData = () => {
  return {
    apporteurs,
    clients,
    collaborateurs,
    missions,
  };
};

// ============ RESET ============
export const resetData = () => {
  missions = [...data.missions];
  clients = [...data.clients];
  apporteurs = [...data.apporteurs];
  collaborateurs = [...data.collaborateurs];
};
