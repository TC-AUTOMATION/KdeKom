const data = require("./src/lib/data.json");
const missions = data.missions;

let caGenere = 0;
let montantSub = 0;
let montantClient = 0;

const byMonth = {};

missions.forEach(m => {
  caGenere += m.ca_genere || 0;
  montantSub += m.montant_sub || 0;
  montantClient += m.montant_client || 0;

  const mois = m.mois;
  if (!byMonth[mois]) {
    byMonth[mois] = { ca_genere: 0, montant_sub: 0, montant_client: 0, count: 0 };
  }
  byMonth[mois].ca_genere += m.ca_genere || 0;
  byMonth[mois].montant_sub += m.montant_sub || 0;
  byMonth[mois].montant_client += m.montant_client || 0;
  byMonth[mois].count++;
});

console.log("=== TOTAUX ===");
console.log("CA Généré:", caGenere);
console.log("Montant Sub:", montantSub);
console.log("Montant Client:", montantClient);
console.log("");
console.log("=== PAR MOIS ===");
const ordre = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
ordre.forEach(mois => {
  if (byMonth[mois]) {
    console.log(mois + ": CA=" + byMonth[mois].ca_genere + " SUB=" + byMonth[mois].montant_sub + " CLIENT=" + byMonth[mois].montant_client + " (" + byMonth[mois].count + " missions)");
  }
});
