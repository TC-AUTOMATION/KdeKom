import mockData from './mockData.json';

// Simulated delay to mimic API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for mutations
let localMissions = [...mockData.missions];
let localClients = [...mockData.clients];
let localPersons = [...mockData.persons];

// Missions
export const fetchMissions = async () => {
  await delay(300);
  return localMissions;
};

export const createMission = async (mission: any) => {
  await delay(300);
  const newMission = {
    ...mission,
    id: String(localMissions.length + 1),
    status: 'active',
    is_paid: false,
  };
  localMissions.push(newMission);
  return newMission;
};

export const toggleMissionPaid = async (id: string) => {
  await delay(200);
  const mission = localMissions.find(m => m.id === id);
  if (mission) {
    mission.is_paid = !mission.is_paid;
  }
  return mission;
};

// Clients
export const fetchClients = async () => {
  await delay(200);
  return localClients;
};

// Persons
export const fetchPersons = async () => {
  await delay(200);
  return localPersons;
};

export const fetchPersonDetails = async (id: string) => {
  await delay(200);
  const person = localPersons.find(p => p.id === id);
  if (!person) {
    throw new Error('Person not found');
  }

  // Enhance person with related missions data
  const personMissions = localMissions.filter(m =>
    m.apporteur_name === person.name || m.consultant_name === person.name
  );

  const totalRevenue = personMissions.reduce((sum, m) => sum + (m.amount_billed || 0), 0);
  const paidRevenue = personMissions
    .filter(m => m.is_paid)
    .reduce((sum, m) => sum + (m.amount_billed || 0), 0);

  return {
    ...person,
    missions: personMissions,
    totalRevenue,
    paidRevenue,
    pendingRevenue: totalRevenue - paidRevenue,
  };
};

// Recap
export const fetchRecap = async (month: string) => {
  await delay(300);

  // Filter missions for the given month
  const monthMissions = localMissions.filter(m => m.month === month);

  const totalCA = monthMissions.reduce((sum, m) => sum + (m.amount_billed || 0), 0);
  const paidCA = monthMissions
    .filter(m => m.is_paid)
    .reduce((sum, m) => sum + (m.amount_billed || 0), 0);
  const reliquatCA = totalCA - paidCA;

  // Calculate distributions by person (simplified)
  const distributions: { [key: string]: number } = {};

  monthMissions.forEach(mission => {
    if (mission.apporteur_name) {
      distributions[mission.apporteur_name] =
        (distributions[mission.apporteur_name] || 0) + (mission.amount_billed * 0.3);
    }
    if (mission.consultant_name) {
      distributions[mission.consultant_name] =
        (distributions[mission.consultant_name] || 0) + (mission.amount_billed * 0.5);
    }
  });

  return {
    month,
    caTotal: totalCA,
    caPaye: paidCA,
    reliquatTotal: reliquatCA,
    missionsCount: monthMissions.length,
    personTotals: distributions,
    missions: monthMissions,
  };
};

// Reset mock data (useful for testing)
export const resetMockData = () => {
  localMissions = [...mockData.missions];
  localClients = [...mockData.clients];
  localPersons = [...mockData.persons];
};
