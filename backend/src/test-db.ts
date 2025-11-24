import { query } from './database/db';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    
    console.log('Testing missions query...');
    const missions = await query('SELECT * FROM missions LIMIT 1');
    console.log('Missions query successful:', missions.rows);
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testConnection();