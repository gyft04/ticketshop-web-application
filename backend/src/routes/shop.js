'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db');

const query = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, results) => err ? reject(err) : resolve(results));
});

// GET /api/shop/:slug — public shop page for an organizer
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const organizers = await query('SELECT id, name, slug FROM users WHERE slug = ? AND role IN (?, ?)', [slug, 'organizer', 'admin']);
    if (organizers.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const organizer = organizers[0];
    const events = await query(
      `SELECT id, title, description, start_date, end_date, start_time, end_time,
              location, category, image, status, geo_lat, geo_lng
       FROM events
       WHERE organizer_id = ? AND status = 'published'
       ORDER BY start_date ASC`,
      [organizer.id]
    );
    res.json({ organizerName: organizer.name, slug: organizer.slug, events });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
