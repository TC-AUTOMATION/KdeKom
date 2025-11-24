import * as XLSX from 'xlsx';
import path from 'path';

const excelPath = path.join(__dirname, '../../KdeKom.xlsx');

try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = 'MISSIONS';
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
        throw new Error(`Sheet ${sheetName} not found`);
    }

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: null }) as any[][];
    
    console.log(`Total rows: ${data.length}`);

    // Find the header row (row 1 based on previous analysis)
    const headerRowIndex = 1;
    const headers = data[headerRowIndex];

    console.log('\n--- Column Mapping Analysis ---');
    headers.forEach((header, index) => {
        if (header || index < 50) { // Show first 50 columns even if empty
            console.log(`Index ${index}: '${header}'`);
        }
    });

    console.log('\n--- Data Sample (First 3 non-empty data rows) ---');
    let count = 0;
    for (let i = 4; i < data.length && count < 3; i++) {
        const row = data[i];
        // Check if row has a mission title (Index 7)
        if (row[7]) {
            console.log(`\nRow ${i}:`);
            row.forEach((val, index) => {
                if (index < 50) { // Limit to first 50 columns
                     // Only show if header exists or value exists
                    if (headers[index] || val !== null) {
                        console.log(`  [${index}] ${headers[index] || 'NO_HEADER'}: ${val}`);
                    }
                }
            });
            count++;
        }
    }

} catch (error) {
    console.error('Error:', error);
}