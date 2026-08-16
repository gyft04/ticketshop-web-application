const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db.js');


exports.register = async (req, res) => {
    const { email, password, name, role, slug } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const allowedRole = (role === 'organizer') ? 'organizer' : 'user';

    let finalSlug = null;
    if (allowedRole === 'organizer') {
        if (slug) {
            finalSlug = slug;
        } else {
            const base = (name || email).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
            finalSlug = base + '-' + Date.now().toString(36);
        }
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        db.query(
        'INSERT INTO users (email, password, name, role, slug) VALUES (?, ?, ?, ?, ?)',
        [email, passwordHash, name || null, allowedRole, finalSlug],
        (error, result) => {
        if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message && error.message.toLowerCase().includes('slug')) {
                return res.status(409).json({ error: 'Slug already taken. Choose a different shop URL.' });
            }
            return res.status(409).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Database query failed' });
        }

            return res.status(201).json({
            message: 'User created',
            id: result.insertId,
            });
        }
        );
    } catch (error) {
        return res.status(500).json({ error: 'Password hashing failed' });
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.query(
        'SELECT id, email, password, role, name, slug FROM users WHERE email = ?',
        [email],
        async (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = results[0];

        const passwordOk = await bcrypt.compare(password, user.password);
        if (!passwordOk) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, slug: user.slug },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role,
            name: user.name,
            slug: user.slug,
        });
        }
    );
};