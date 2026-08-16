'use strict';
const mysql = require('mysql2/promise');
require('dotenv').config();
const DB_CONFIG = { host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };

async function main() {
  const conn = await mysql.createConnection(DB_CONFIG);
  try {
    const [cols] = await conn.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='ticketshop' AND TABLE_NAME='users' AND COLUMN_NAME='slug'");
    if (cols.length === 0) {
      await conn.execute("ALTER TABLE users ADD COLUMN slug VARCHAR(100) UNIQUE DEFAULT NULL");
      console.log('slug column added to users table.');
    } else {
      console.log('slug column already exists, skipping.');
    }
  } catch(e) {
    console.log('Note:', e.message);
  } finally {
    await conn.end();
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
