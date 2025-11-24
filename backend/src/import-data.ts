import * as XLSX from 'xlsx';
import path from 'path';
import pool from './database/db';

const excelPath = path.join(__dirname, '../../KdeKom.xlsx');

const monthMap: { [key: string]: string } = {
    'Janvier': '01', 'Février': '02', 'Mars': '03', 'Avril': '04',
    'Mai': '05', 'Juin': '06', 'Juillet': '07', 'Août': '08',
    'Septembre': '09', 'Octobre': '10', 'Novembre': '11', 'Décembre': '12'
};

// Column Mappings (0-based index)
const COLS = {
    APPORTEUR: 0, // A
    APPORTEUR_COMM: 1, // B
    PARRAIN: 2, // C
    PARRAIN_COMM: 3, // D
    CLIENT: 5, // F
    MISSION: 7, // H
    MONTH: 8, // I
    AMOUNT_BILLED: 11, // L
    INITIAL_FEES: 13, // N (Based on schema mapping, though header is 'x' and M is '€€')
    AGENCY_FEES: 15, // P
    FIXED_FEES: 16, // Q
    MANAGEMENT_FEES: 17, // R
    ML_AMOUNT: 18, // S
    LT_AMOUNT: 19, // T
    REMAINDER_AFTER_INITIAL: 14, // O
    REMAINDER_BEFORE_COMM: 20, // U
    BASE_FOR_DISTRIBUTION: 21, // V
    RELIQUAT: 46 // AU (Approximate, need to verify if it's AU)
};

// Helper to parse float
const parseFloatSafe = (val: any): number => {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return val;
    const parsed = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
};

async function importData() {
    const client = await pool.connect();
    
    try {
        console.log('Starting import...');
        const workbook = XLSX.readFile(excelPath);
        const sheetName = 'MISSIONS';
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
            throw new Error(`Sheet ${sheetName} not found`);
        }

        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: null }) as any[][];
        
        console.log(`Found ${data.length} rows in ${sheetName}`);

        // Start transaction
        await client.query('BEGIN');

        let importedCount = 0;

        // Iterate rows, skipping headers (start from index 4 based on analysis)
        for (let i = 4; i < data.length; i++) {
            const row = data[i];
            
            // Skip empty rows or rows without Mission title
            if (!row[COLS.MISSION]) continue;

            const missionTitle = row[COLS.MISSION];
            const clientName = row[COLS.CLIENT];
            const apporteurName = row[COLS.APPORTEUR];
            const parrainName = row[COLS.PARRAIN];
            const monthName = row[COLS.MONTH];

            // 1. Handle Client
            let clientId = null;
            if (clientName) {
                const existingClient = await client.query('SELECT id FROM clients WHERE name = $1', [clientName]);
                if (existingClient.rows.length > 0) {
                    clientId = existingClient.rows[0].id;
                } else {
                    const newClient = await client.query('INSERT INTO clients (name) VALUES ($1) RETURNING id', [clientName]);
                    clientId = newClient.rows[0].id;
                }
            }

            // 2. Handle Parrain (if exists)
            let parrainId = null;
            if (parrainName) {
                const existingParrain = await client.query('SELECT id FROM persons WHERE name = $1', [parrainName]);
                if (existingParrain.rows.length > 0) {
                    parrainId = existingParrain.rows[0].id;
                } else {
                    // Assume role 'consultant' for parrain if creating new
                    const newParrain = await client.query(
                        `INSERT INTO persons (name, role) VALUES ($1, 'consultant') RETURNING id`,
                        [parrainName]
                    );
                    parrainId = newParrain.rows[0].id;
                }
            }

            // 3. Handle Apporteur
            let apporteurId = null;
            if (apporteurName) {
                const existingApporteur = await client.query('SELECT id FROM persons WHERE name = $1', [apporteurName]);
                if (existingApporteur.rows.length > 0) {
                    apporteurId = existingApporteur.rows[0].id;
                    // Update parrain if needed
                    if (parrainId) {
                        await client.query('UPDATE persons SET parrain_id = $1 WHERE id = $2', [parrainId, apporteurId]);
                    }
                } else {
                    const newApporteur = await client.query(
                        `INSERT INTO persons (name, role, parrain_id) VALUES ($1, 'apporteur', $2) RETURNING id`,
                        [apporteurName, parrainId]
                    );
                    apporteurId = newApporteur.rows[0].id;
                }
            }

            // 4. Handle Mission
            // Format month
            let monthStr = '';
            if (monthName && monthMap[monthName]) {
                monthStr = `2025-${monthMap[monthName]}`; // Defaulting to 2025
            } else {
                // Try to parse if it's already a date or other format
                monthStr = '2025-01'; // Fallback
                console.warn(`Row ${i}: Could not parse month '${monthName}', defaulting to ${monthStr}`);
            }

            const amountBilled = parseFloatSafe(row[COLS.AMOUNT_BILLED]);
            const initialFees = parseFloatSafe(row[COLS.INITIAL_FEES]);
            const agencyFees = parseFloatSafe(row[COLS.AGENCY_FEES]);
            const fixedFees = parseFloatSafe(row[COLS.FIXED_FEES]);
            const managementFees = parseFloatSafe(row[COLS.MANAGEMENT_FEES]);
            const mlAmount = parseFloatSafe(row[COLS.ML_AMOUNT]);
            const ltAmount = parseFloatSafe(row[COLS.LT_AMOUNT]);
            const apporteurComm = parseFloatSafe(row[COLS.APPORTEUR_COMM]);
            const parrainComm = parseFloatSafe(row[COLS.PARRAIN_COMM]);
            
            const remainderAfterInitial = parseFloatSafe(row[COLS.REMAINDER_AFTER_INITIAL]);
            const remainderBeforeComm = parseFloatSafe(row[COLS.REMAINDER_BEFORE_COMM]);
            const baseForDist = parseFloatSafe(row[COLS.BASE_FOR_DISTRIBUTION]);
            const reliquat = parseFloatSafe(row[COLS.RELIQUAT]);

            await client.query(
                `INSERT INTO missions (
                    title, month, client_id, apporteur_id,
                    amount_billed, initial_fees, agency_fees, fixed_fees, management_fees,
                    ml_amount, lt_amount,
                    apporteur_commission, parrain_commission,
                    remainder_after_initial, remainder_before_commissions, base_for_distribution, reliquat
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
                [
                    missionTitle, monthStr, clientId, apporteurId,
                    amountBilled, initialFees, agencyFees, fixedFees, managementFees,
                    mlAmount, ltAmount,
                    apporteurComm, parrainComm,
                    remainderAfterInitial, remainderBeforeComm, baseForDist, reliquat
                ]
            );

            importedCount++;
        }

        await client.query('COMMIT');
        console.log(`Successfully imported ${importedCount} missions.`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error importing data:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

importData();