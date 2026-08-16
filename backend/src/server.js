require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const eventsRoutes = require('./routes/events');
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const statsRoutes = require('./routes/stats');
const cartRoutes = require('./routes/cart');
const organizerRoutes = require('./routes/organizer');
const shopRoutes = require('./routes/shop');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Multer config: max 5MB, images only
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = Date.now() + '-' + Math.random().toString(36).slice(2) + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only image files allowed'));
  }
});

// Upload endpoint - no auth required for simplicity
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `http://localhost:3000/uploads/${req.file.filename}`;
  res.json({ url });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/shop', shopRoutes);

app.listen(3000, function() {
  console.log('Server is running on port 3000');
});
