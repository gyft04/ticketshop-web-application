'use strict';
const mysql = require('mysql2/promise');

require('dotenv').config();
const DB_CONFIG = { host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };

async function main() {
  const conn = await mysql.createConnection(DB_CONFIG);
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT NOT NULL AUTO_INCREMENT,
        session_id VARCHAR(100) NOT NULL,
        ticket_category_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (ticket_category_id) REFERENCES ticket_categories(id) ON DELETE CASCADE
      )
    `);
    console.log('cart_items table created.');
  } finally {
    await conn.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });
