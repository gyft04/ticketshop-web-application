'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// ─── Config ─────────────────────────────────────────────────────────────────

require('dotenv').config();
const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const ORGANIZER_ID = 2;

const EVENTS_FILE = path.join(__dirname, '..', 'data', 'events.json');

const IMAGE_BASE_URL = 'https://www.eventim-light.com/de/api/image';
const IMAGE_SUFFIX = 'shop_cover_v3/webp';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Parses an ISO 8601 datetime string and returns separate date and time parts.
 * Returns { date: 'YYYY-MM-DD', time: 'HH:MM:SS' } or nulls if input is falsy.
 */
function parseDatetime(isoString) {
  if (!isoString) {
    return { date: null, time: null };
  }

  // new Date() handles ISO 8601 with timezone offsets correctly.
  const dt = new Date(isoString);

  if (isNaN(dt.getTime())) {
    return { date: null, time: null };
  }

  // We want the LOCAL time as written in the source string, not UTC.
  // Strategy: strip timezone offset and parse directly as local.
  // "2025-08-21T20:00:00+02:00" → strip "+02:00" → "2025-08-21T20:00:00"
  const stripped = isoString.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
  const local = new Date(stripped);

  const year  = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, '0');
  const day   = String(local.getDate()).padStart(2, '0');
  const hours = String(local.getHours()).padStart(2, '0');
  const mins  = String(local.getMinutes()).padStart(2, '0');
  const secs  = String(local.getSeconds()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${mins}:${secs}`,
  };
}

/**
 * Builds the full image URL from an image id.
 */
function buildImageUrl(imageId) {
  if (!imageId) return null;
  return `${IMAGE_BASE_URL}/${imageId}/${IMAGE_SUFFIX}`;
}

/**
 * Derives the status string from an event object.
 */
function resolveStatus(event) {
  if (event.soldout === true) return 'soldout';
  return 'published';
}

/**
 * Derives ticket category prices from an event object.
 * Returns { standardPrice, vipPrice }.
 */
function resolvePrices(event) {
  const minPrice = event.minPrice;
  const maxPrice = event.maxPrice;

  if (!minPrice) {
    return { standardPrice: 15.00, vipPrice: 25.00 };
  }

  const standardPrice = minPrice.basePrice !== undefined
    ? minPrice.basePrice
    : minPrice.value;

  const maxBase = maxPrice && maxPrice.basePrice !== undefined
    ? maxPrice.basePrice
    : (maxPrice ? maxPrice.value : standardPrice);

  const vipPrice = Math.round(maxBase * 1.5 * 100) / 100;

  return { standardPrice, vipPrice };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Load JSON
  if (!fs.existsSync(EVENTS_FILE)) {
    console.error(`ERROR: events.json not found at: ${EVENTS_FILE}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(EVENTS_FILE, 'utf8');
  const events = JSON.parse(raw);

  console.log(`Loaded ${events.length} events from events.json`);

  // 2. Connect
  const connection = await mysql.createConnection(DB_CONFIG);
  console.log('Connected to MySQL database.');

  try {
    // 3. Clear existing data (order matters: deepest child first)
    await connection.execute('DELETE FROM order_items');
    await connection.execute('DELETE FROM cart_items');
    await connection.execute('DELETE FROM ticket_categories');
    await connection.execute('DELETE FROM events');
    console.log('Cleared existing order_items, cart_items, ticket_categories, and events.');

    // 4. Insert events one by one
    let importedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      try {
        // --- Parse fields ---
        const title       = event.title || '(no title)';
        const description = event.subtitle || '';

        const startParts = parseDatetime(event.start);
        const endParts   = parseDatetime(event.end);

        const location = event.venue
          ? `${event.venue.name}, ${event.venue.city}`
          : '';

        const category    = event.category || '';
        const imageUrl    = buildImageUrl(event.image && event.image.id);
        const status      = resolveStatus(event);

        // --- Parse geo coordinates ---
        const geoLat = event.venue?.geo?.latitude ? parseFloat(event.venue.geo.latitude) : null;
        const geoLng = event.venue?.geo?.longitude ? parseFloat(event.venue.geo.longitude) : null;

        // --- Insert into events ---
        const [eventResult] = await connection.execute(
          `INSERT INTO events
             (title, description, start_date, end_date, start_time, end_time,
              location, category, image, status, organizer_id, geo_lat, geo_lng)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            description,
            startParts.date,
            endParts.date,
            startParts.time,
            endParts.time,
            location,
            category,
            imageUrl,
            status,
            ORGANIZER_ID,
            geoLat,
            geoLng,
          ]
        );

        const newEventId = eventResult.insertId;

        // --- Resolve ticket prices ---
        const { standardPrice, vipPrice } = resolvePrices(event);

        // --- Insert Standard ticket category ---
        await connection.execute(
          `INSERT INTO ticket_categories (event_id, name, price, quantity_available)
           VALUES (?, ?, ?, ?)`,
          [newEventId, 'Standard', standardPrice, 50]
        );

        // --- Insert VIP ticket category ---
        await connection.execute(
          `INSERT INTO ticket_categories (event_id, name, price, quantity_available)
           VALUES (?, ?, ?, ?)`,
          [newEventId, 'VIP', vipPrice, 20]
        );

        importedCount++;

        // Log progress every 20 events
        if (importedCount % 20 === 0) {
          console.log(`Progress: ${importedCount} / ${events.length} events imported...`);
        }

      } catch (err) {
        errorCount++;
        console.error(`ERROR importing event at index ${i} ("${event.title}"): ${err.message}`);
        // Continue with next event
      }
    }

    // 5. Summary
    console.log('─────────────────────────────────────');
    console.log(`Import complete.`);
    console.log(`  Successfully imported : ${importedCount} events`);
    if (errorCount > 0) {
      console.log(`  Failed               : ${errorCount} events`);
    }
    console.log('─────────────────────────────────────');

  } finally {
    await connection.end();
    console.log('Database connection closed.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
