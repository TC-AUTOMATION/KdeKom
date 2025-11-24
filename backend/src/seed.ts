import { query } from './database/db';

async function seed() {
  try {
    console.log('Seeding database...');

    // Create Clients
    const clientAdrian = await query("INSERT INTO clients (name, email) VALUES ('Adrian', 'adrian@example.com') RETURNING id");
    const clientB = await query("INSERT INTO clients (name, email) VALUES ('Client B', 'clientb@example.com') RETURNING id");

    // Create Persons
    const fred = await query("INSERT INTO persons (name, role, default_percentage) VALUES ('Fred', 'consultant', 0.03) RETURNING id");
    const eric = await query("INSERT INTO persons (name, role, default_percentage) VALUES ('Eric', 'consultant', 0.05) RETURNING id");
    const ml = await query("INSERT INTO persons (name, role) VALUES ('Ml', 'manager') RETURNING id");
    const lt = await query("INSERT INTO persons (name, role) VALUES ('Lt', 'manager') RETURNING id");

    // Apporteurs
    const colpa = await query("INSERT INTO persons (name, role) VALUES ('Colpa', 'apporteur') RETURNING id");
    const naOya = await query("INSERT INTO persons (name, role) VALUES ('Na Oya', 'apporteur') RETURNING id");

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}

seed();