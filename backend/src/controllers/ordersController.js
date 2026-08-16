const db = require('../db');

// Query auf dem Pool. Jeder Aufruf kann eine andere Connection
// erwischen - nur fuer einzelne, unabhaengige Abfragen verwenden.
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

// Holt EINE feste Connection aus dem Pool.
const getConnection = () => {
    return new Promise((resolve, reject) => {
        db.getConnection((error, connection) => {
            if (error) {
                return reject(error);
            }
            resolve(connection);
        });
    });
};

// Query-Helper, fest an diese eine Connection gebunden. Nur so
// laufen START TRANSACTION, FOR UPDATE, COMMIT und ROLLBACK
// garantiert ueber dieselbe Verbindung.
const makeQuery = (connection) => (sql, params = []) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

exports.createOrder = async (req, res) => {
    const userId = req.user?.userId;
    const { items } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'items array is required' });
    }

    let connection;
    try {
        connection = await getConnection();
    } catch (error) {
        console.error('Keine DB-Connection verfuegbar:', error.code, error.message);
        return res.status(500).json({ error: 'Database connection failed' });
    }

    const q = makeQuery(connection);

    try {
        await q('START TRANSACTION');

        let totalPrice = 0;
        const normalizedItems = [];
        const betroffeneEvents = new Set();

        for (const item of items) {
            const ticketCategoryId = item.ticket_category_id;
            const quantity = Number(item.quantity);

            if (!ticketCategoryId || !Number.isInteger(quantity) || quantity <= 0) {
                throw new Error('Invalid order item');
            }

            // event_id wird mitgelesen, um weiter unten den
            // soldout-Status setzen zu koennen.
            const tickets = await q(
                'SELECT id, event_id, price, quantity_available FROM ticket_categories WHERE id = ? FOR UPDATE',
                [ticketCategoryId]
            );

            if (tickets.length === 0) {
                throw {
                    status: 404,
                    message: `Ticket category ${ticketCategoryId} not found`
                };
            }

            const ticket = tickets[0];

            if (ticket.quantity_available < quantity) {
                throw {
                    status: 409,
                    message: `Not enough tickets for category ${ticketCategoryId}`
                };
            }

            const itemPrice = Number(ticket.price);
            totalPrice += itemPrice * quantity;

            betroffeneEvents.add(ticket.event_id);

            normalizedItems.push({
                ticket_category_id: ticketCategoryId,
                quantity,
                price: itemPrice
            });
        }

        // 1) Bestellung anlegen
        const orderResult = await q(
            'INSERT INTO orders (user_id, total_price, order_status) VALUES (?, ?, ?)',
            [userId, totalPrice, 'pending']
        );

        const orderId = orderResult.insertId;

        // 2) Einzelne Positionen anlegen und Bestand fortschreiben
        for (const item of normalizedItems) {
            await q(
                'INSERT INTO order_items (order_id, ticket_category_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.ticket_category_id, item.quantity, item.price]
            );

            await q(
                'UPDATE ticket_categories SET quantity_available = quantity_available - ?, quantity_sold = quantity_sold + ? WHERE id = ?',
                [item.quantity, item.quantity, item.ticket_category_id]
            );
        }

        // 3) Events auf soldout setzen, bei denen keine einzige
        //    Kategorie mehr Restbestand hat. Laeuft bewusst innerhalb
        //    der Transaktion, damit Bestand und Status zusammenpassen.
        for (const eventId of betroffeneEvents) {
            await q(
                `UPDATE events
                    SET status = 'soldout'
                  WHERE id = ?
                    AND status = 'published'
                    AND NOT EXISTS (
                        SELECT 1 FROM ticket_categories
                         WHERE event_id = ? AND quantity_available > 0
                    )`,
                [eventId, eventId]
            );
        }

        await q('COMMIT');

        return res.status(201).json({
            message: 'Order created',
            orderId,
            totalPrice
        });
    } catch (error) {
        // Abgesichert: scheitert auch der Rollback, soll der
        // urspruengliche Fehler nicht verlorengehen.
        try {
            await q('ROLLBACK');
        } catch (rollbackError) {
            console.error('ROLLBACK fehlgeschlagen:', rollbackError.message);
        }

        console.error(error);
        return res.status(error.status || 500).json({
            error: error.message || 'Database query failed'
        });
    } finally {
        // Ohne release() bleibt die Connection belegt und der Pool
        // laeuft nach wenigen Bestellungen leer.
        connection.release();
    }
};

exports.getOrders = async (req, res) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const orders = await query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        for (const order of orders) {
            const items = await query(
                `SELECT oi.quantity, oi.price, tc.name AS ticket_name, e.title AS event_title
                 FROM order_items oi
                 JOIN ticket_categories tc ON oi.ticket_category_id = tc.id
                 JOIN events e ON tc.event_id = e.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        return res.json(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database query failed' });
    }
};

exports.getOrderById = async (req, res) => {
    const userId = req.user?.userId;
    const orderId = req.params.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const orders = await query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];

        const items = await query(
            `SELECT oi.quantity, oi.price, tc.name AS ticket_name, e.title AS event_title
             FROM order_items oi
             JOIN ticket_categories tc ON oi.ticket_category_id = tc.id
             JOIN events e ON tc.event_id = e.id
             WHERE oi.order_id = ?`,
            [order.id]
        );

        order.items = items;

        return res.json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database query failed' });
    }
};