const db = require('../db.js');

exports.getAllEvents = (req, res) => {
    db.query(
        `SELECT id, title, description, start_date, end_date, start_time, end_time,
                location, category, image, status, organizer_id, geo_lat, geo_lng
           FROM events
          WHERE status IN ('published', 'soldout')
          ORDER BY start_date ASC`,
        (error, results) => {
            if (error) {
                console.error('EVENTS ERROR:', error.code, error.message);
                return res.status(500).json({ error: 'Database connection failed' });
            }
            res.json(results);
        }
    );
};

exports.getEventById = (req, res) => {
    const id = req.params.id;

    db.query('SELECT id, title, description, start_date, end_date, start_time, end_time, location, category, image, status, organizer_id, geo_lat, geo_lng FROM events WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({
                error: 'Database query failed'
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                error: 'Event not found'
            });
        }
        res.json(results[0]);
    })
}

exports.getTicketsByEventId = (req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM ticket_categories WHERE event_id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No tickets found for this event' });
        }
    
        res.json(results);
    })
}

exports.createEvent = (req, res) => {
    console.log('POST /api/events reached');
    const { title, description, start_date, end_date, start_time, end_time, location, category, image, status } = req.body;
    const organizer_id = req.user?.userId;
    if (!organizer_id) return res.status(401).json({ error: 'Unauthorized' });

    const sql = `INSERT INTO events
        (title, description, start_date, end_date, start_time, end_time, location, category, image, status, organizer_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [title, description, start_date, end_date, start_time, end_time, location, category, image, status, organizer_id];

    db.query(sql, values, (error, result) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        const eventId = result.insertId;
        const standardPrice = parseFloat(req.body.standard_price) || 15;
        const standardQty = parseInt(req.body.standard_qty) || 50;
        const vipPrice = parseFloat(req.body.vip_price) || 25;
        const vipQty = parseInt(req.body.vip_qty) || 20;

        const ticketSql = 'INSERT INTO ticket_categories (event_id, name, price, quantity_available) VALUES (?, ?, ?, ?), (?, ?, ?, ?)';
        db.query(ticketSql, [eventId, 'Standard', standardPrice, standardQty, eventId, 'VIP', vipPrice, vipQty], (ticketErr) => {
            if (ticketErr) {
                return res.status(500).json({ error: 'Event created but ticket categories failed' });
            }
            res.status(201).json({ message: 'Event created', id: eventId });
        });
    });
};

// GET /api/organizer/events — only events belonging to the logged-in organizer
exports.getMyEvents = (req, res) => {
    const organizerId = req.user?.userId;
    if (!organizerId) return res.status(401).json({ error: 'Unauthorized' });

    db.query(
        'SELECT id, title, description, start_date, end_date, start_time, end_time, location, category, image, status, organizer_id, geo_lat, geo_lng FROM events WHERE organizer_id = ? ORDER BY start_date DESC',
        [organizerId],
        (error, results) => {
            if (error) return res.status(500).json({ error: 'Database query failed' });
            res.json(results);
        }
    );
};

// PUT /api/organizer/events/:id — update own event
exports.updateEvent = (req, res) => {
    const organizerId = req.user?.userId;
    const eventId = req.params.id;
    if (!organizerId) return res.status(401).json({ error: 'Unauthorized' });

    const { title, description, start_date, end_date, start_time, end_time, location, category, image, status } = req.body;

    db.query(
        `UPDATE events SET title=?, description=?, start_date=?, end_date=?, start_time=?, end_time=?, location=?, category=?, image=?, status=?
         WHERE id=? AND organizer_id=?`,
        [title, description, start_date, end_date, start_time, end_time, location, category, image, status, eventId, organizerId],
        (error, result) => {
            if (error) return res.status(500).json({ error: 'Database query failed' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found or not yours' });
            res.json({ message: 'Event updated' });
        }
    );
};

// DELETE /api/organizer/events/:id — delete own event
exports.deleteEvent = (req, res) => {
    const organizerId = req.user?.userId;
    const eventId = req.params.id;
    if (!organizerId) return res.status(401).json({ error: 'Unauthorized' });

    // Must delete ticket_categories first due to FK
    db.query('DELETE FROM ticket_categories WHERE event_id = ? AND (SELECT organizer_id FROM events WHERE id = ?) = ?',
        [eventId, eventId, organizerId],
        (err) => {
            if (err) return res.status(500).json({ error: 'Database query failed' });
            db.query('DELETE FROM events WHERE id = ? AND organizer_id = ?', [eventId, organizerId], (error, result) => {
                if (error) return res.status(500).json({ error: 'Database query failed' });
                if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found or not yours' });
                res.status(204).send();
            });
        }
    );
};








