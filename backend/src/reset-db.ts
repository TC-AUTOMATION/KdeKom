import { query } from './database/db';
import fs from 'fs';
import path from 'path';

async function resetDb() {
  try {
    console.log('Dropping existing tables...');
    await query('DROP TABLE IF EXISTS mission_distributions CASCADE');
    await query('DROP TABLE IF EXISTS missions CASCADE');
    await query('DROP TABLE IF EXISTS persons CASCADE');
    await query('DROP TABLE IF EXISTS clients CASCADE');

    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying new schema...');
    await query(schemaSql);

    console.log('Database reset successfully!');
  } catch (error) {
    console.error('Failed to reset database:', error);
  }
}

resetDb();