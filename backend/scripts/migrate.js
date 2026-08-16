'use strict';

const mysql = require('mysql2/promise');

require('dotenv').config();
const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function main() {
  const connection = await mysql.createConnection(DB_CONFIG);
  console.log('Connected.');

  try {
    // Fix events.status ENUM to include soldout
    await connection.execute(`
      ALTER TABLE events
        MODIFY COLUMN status ENUM('draft', 'published', 'cancelled', 'soldout') NOT NULL DEFAULT 'published'
    `);
    console.log('✓ events.status ENUM updated');

    // Fix events.image to allow NULL and longer URLs
    await connection.execute(`
      ALTER TABLE events
        MODIFY COLUMN image VARCHAR(500) DEFAULT NULL
    `);
    console.log('✓ events.image made nullable, length 500');

  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await connection.end();
    console.log('Done.');
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
