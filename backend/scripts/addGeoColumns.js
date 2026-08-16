'use strict';
const mysql = require('mysql2/promise');
require('dotenv').config();
const DB_CONFIG = { host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };


async function main() {
  const conn = await mysql.createConnection(DB_CONFIG);
  try {
    try {
      await conn.execute('ALTER TABLE events ADD COLUMN geo_lat DECIMAL(10,6) DEFAULT NULL');
      console.log('geo_lat column added.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('geo_lat already exists, skipping.');
      else throw e;
    }
    try {
      await conn.execute('ALTER TABLE events ADD COLUMN geo_lng DECIMAL(10,6) DEFAULT NULL');
      console.log('geo_lng column added.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('geo_lng already exists, skipping.');
      else throw e;
    }
    console.log('Migration complete.');
  } finally {
    await conn.end();
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
