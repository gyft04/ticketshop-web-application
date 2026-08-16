const db = require('../db');

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

exports.getStats = async (req, res) => {
    try {
        // 1) Gesamtumsatz und Gesamtbestellungen
        const [overview] = await query(`
            SELECT
                COUNT(DISTINCT o.id)            AS total_orders,
                SUM(o.total_price)              AS total_revenue,
                COUNT(DISTINCT o.user_id)       AS unique_customers,
                SUM(oi.quantity)                AS total_tickets_sold
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
        `);

        // 2) Umsatz und Tickets pro Event
        const revenuePerEvent = await query(`
            SELECT
                e.title                         AS event_title,
                e.category,
                SUM(oi.quantity)                AS tickets_sold,
                SUM(oi.quantity * oi.price)     AS revenue
            FROM order_items oi
            JOIN ticket_categories tc ON oi.ticket_category_id = tc.id
            JOIN events e ON tc.event_id = e.id
            GROUP BY e.id, e.title, e.category
            ORDER BY revenue DESC
        `);

        // 3) Meistverkaufte Ticket-Kategorien
        const topTickets = await query(`
            SELECT
                tc.name                         AS ticket_name,
                e.title                         AS event_title,
                SUM(oi.quantity)                AS quantity_sold,
                SUM(oi.quantity * oi.price)     AS revenue
            FROM order_items oi
            JOIN ticket_categories tc ON oi.ticket_category_id = tc.id
            JOIN events e ON tc.event_id = e.id
            GROUP BY tc.id, tc.name, e.title
            ORDER BY quantity_sold DESC
            LIMIT 5
        `);

        // 4) Umsatz pro Kategorie
        const revenuePerCategory = await query(`
            SELECT
                e.category,
                COUNT(DISTINCT e.id)            AS event_count,
                SUM(oi.quantity)                AS tickets_sold,
                SUM(oi.quantity * oi.price)     AS revenue
            FROM order_items oi
            JOIN ticket_categories tc ON oi.ticket_category_id = tc.id
            JOIN events e ON tc.event_id = e.id
            GROUP BY e.category
            ORDER BY revenue DESC
        `);

        // 5) Bestellungen pro Tag (letzte 7 Tage)
        const ordersPerDay = await query(`
            SELECT
                DATE(created_at)                AS order_date,
                COUNT(*)                        AS order_count,
                SUM(total_price)                AS daily_revenue
            FROM orders
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY order_date ASC
        `);

        return res.json({
            overview,
            revenuePerEvent,
            topTickets,
            revenuePerCategory,
            ordersPerDay
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database query failed' });
    }
};
