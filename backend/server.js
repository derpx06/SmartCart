require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Feed = require('./models/Feed');
const Sku = require('./models/Sku');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Wishlist = require('./models/Wishlist');
const BuyLater = require('./models/BuyLater');

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

// --- Product Routes ---
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Cart Routes ---
app.get('/cart', authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
    if (!cart) cart = { items: [] };
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/cart/add', authenticateToken, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      cart = new Cart({ userId: req.user.userId, items: [{ productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }
    await cart.save();
    cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/cart/update', authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    
    const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
    }
    cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/cart/remove/:productId', authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (cart) {
      cart.items = cart.items.filter(p => p.productId.toString() !== req.params.productId);
      await cart.save();
    }
    cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Order Routes ---
app.get('/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).populate('items.productId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/orders/checkout', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      const price = item.productId.price || 0; // fallback just in case
      totalAmount += price * item.quantity;
      return {
        productId: item.productId._id,
        quantity: item.quantity,
        priceAtPurchase: price
      };
    });

    const order = new Order({
      userId: req.user.userId,
      items: orderItems,
      totalAmount,
      status: 'completed'
    });
    
    await order.save();
    
    cart.items = [];
    await cart.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Wishlist Routes ---
app.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.userId }).populate('items.productId');
    if (!wishlist) wishlist = { items: [] };
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/wishlist/add', authenticateToken, async (req, res) => {
  const { productId } = req.body;
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.userId, items: [{ productId }] });
    } else {
      if (!wishlist.items.some(p => p.productId.toString() === productId)) {
        wishlist.items.push({ productId });
      }
    }
    await wishlist.save();
    wishlist = await Wishlist.findOne({ userId: req.user.userId }).populate('items.productId');
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/wishlist/remove/:productId', authenticateToken, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.userId });
    if (wishlist) {
      wishlist.items = wishlist.items.filter(p => p.productId.toString() !== req.params.productId);
      await wishlist.save();
    }
    wishlist = await Wishlist.findOne({ userId: req.user.userId }).populate('items.productId');
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Buy Later Routes ---
app.get('/buylater', authenticateToken, async (req, res) => {
  try {
    let buylater = await BuyLater.findOne({ userId: req.user.userId }).populate('items.productId');
    if (!buylater) buylater = { items: [] };
    res.json(buylater);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/buylater/add', authenticateToken, async (req, res) => {
  const { productId } = req.body;
  try {
    // Optionally remove from cart if it's there
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (cart) {
      cart.items = cart.items.filter(p => p.productId.toString() !== productId);
      await cart.save();
    }

    let buylater = await BuyLater.findOne({ userId: req.user.userId });
    if (!buylater) {
      buylater = new BuyLater({ userId: req.user.userId, items: [{ productId }] });
    } else {
      if (!buylater.items.some(p => p.productId.toString() === productId)) {
        buylater.items.push({ productId });
      }
    }
    await buylater.save();
    buylater = await BuyLater.findOne({ userId: req.user.userId }).populate('items.productId');
    res.json(buylater);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/buylater/remove/:productId', authenticateToken, async (req, res) => {
  try {
    let buylater = await BuyLater.findOne({ userId: req.user.userId });
    if (buylater) {
      buylater.items = buylater.items.filter(p => p.productId.toString() !== req.params.productId);
      await buylater.save();
    }
    buylater = await BuyLater.findOne({ userId: req.user.userId }).populate('items.productId');
    res.json(buylater);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/buylater/move-to-cart/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Remove from Buy Later
    let buylater = await BuyLater.findOne({ userId: req.user.userId });
    if (buylater) {
      buylater.items = buylater.items.filter(p => p.productId.toString() !== productId);
      await buylater.save();
    }

    // Add to Cart
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      cart = new Cart({ userId: req.user.userId, items: [{ productId, quantity: 1 }] });
    } else {
      const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
    }
    await cart.save();

    // Return the updated cart
    cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
