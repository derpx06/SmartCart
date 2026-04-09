require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Feed = require('./models/Feed');
const Sku = require('./models/Sku');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Support proxying images from local images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected to MongoDB.'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Mapped straight from mock logic, without bcrypt for simplicity
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      userId: user.id,
      name: user.name
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    // Allow unauthenticated fallback to mock user for easy transition
    req.user = { userId: "user_001" };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = { userId: "user_001" };
      return next();
    }
    req.user = user;
    next();
  });
};

app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.userId }, '-_id -__v -password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/feed', async (req, res) => {
  try {
    const feed = await Feed.findOne({}, '-_id -__v').lean();
    if (!feed) {
      return res.json({ items: [] });
    }
    res.json({ items: feed.items });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/skus', async (req, res) => {
  try {
    const skus = await Sku.find({}, '-_id -__v').lean();
    res.json(skus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
