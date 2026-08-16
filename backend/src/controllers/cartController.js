'use strict';
const db = require('../db');

const query = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, results) => err ? reject(err) : resolve(results));
});

// GET /api/cart/:sessionId
exports.getCart = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const rows = await query(
      `SELECT ci.id, ci.ticket_category_id, ci.quantity,
              tc.name AS ticket_name, tc.price,
              e.id AS event_id, e.title AS event_title, e.image
       FROM cart_items ci
       JOIN ticket_categories tc ON ci.ticket_category_id = tc.id
       JOIN events e ON tc.event_id = e.id
       WHERE ci.session_id = ?`,
      [sessionId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

// POST /api/cart
exports.addItem = async (req, res) => {
  const { session_id, ticket_category_id, quantity } = req.body;
  if (!session_id || !ticket_category_id || !quantity) {
    return res.status(400).json({ error: 'session_id, ticket_category_id and quantity are required' });
  }
  try {
    // If item already in cart for this session, update quantity
    const existing = await query(
      'SELECT id, quantity FROM cart_items WHERE session_id = ? AND ticket_category_id = ?',
      [session_id, ticket_category_id]
    );
    if (existing.length > 0) {
      const newQty = existing[0].quantity + Number(quantity);
      await query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
      return res.status(200).json({ message: 'Cart updated', id: existing[0].id });
    }
    const result = await query(
      'INSERT INTO cart_items (session_id, ticket_category_id, quantity) VALUES (?, ?, ?)',
      [session_id, ticket_category_id, quantity]
    );
    res.status(201).json({ message: 'Added to cart', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

// DELETE /api/cart/item/:id
exports.removeItem = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM cart_items WHERE id = ?', [id]);
    res.json({ message: 'Removed' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

// DELETE /api/cart/session/:sessionId  — clears whole cart
exports.clearCart = async (req, res) => {
  const { sessionId } = req.params;
  try {
    await query('DELETE FROM cart_items WHERE session_id = ?', [sessionId]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};
