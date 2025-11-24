import * as XLSX from 'xlsx';
import path from 'path';

const excelPath = path.join(__dirname, '../../KdeKom.xlsx');

try {
    console.log(`Reading file from: ${excelPath}`);
    const workbook = XLSX.readFile(excelPath);
    
    console.log('Sheet Names:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Analyzing Sheet: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        
        // Get headers (first row)
        const headers: string[] = [];
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        
        // Print first 5 rows to understand structure
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: null });
        console.log('First 5 rows:', data.slice(0, 5));
    });

} catch (error) {
    console.error('Error reading Excel file:', error);
}