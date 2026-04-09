import { Router } from 'express';

import { login, profile } from '../controllers/auth.controller';
import {
  getFeed,
  getProductById,
  getProducts,
  getSkus,
} from '../controllers/catalog.controller';
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCart,
  getSmartCartState,
} from '../controllers/cart.controller';
import { checkout, getOrders } from '../controllers/order.controller';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from '../controllers/wishlist.controller';
import {
  addToBuyLater,
  getBuyLater,
  moveToCart,
  removeFromBuyLater,
} from '../controllers/buyLater.controller';
import { healthCheck } from '../controllers/health.controller';
import { uploadImage } from '../controllers/upload.controller';
import { authenticateToken } from '../middleware/authenticateToken';
import { upload } from '../config/cloudinary';

const router = Router();

router.get('/health', healthCheck);
router.get('/smartcart/state', authenticateToken, getSmartCartState);
router.post('/login', login);
router.get('/profile', authenticateToken, profile);
router.post('/upload', authenticateToken, upload.single('image'), uploadImage);

router.get('/feed', getFeed);
router.get('/skus', getSkus);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

router.get('/cart', authenticateToken, getCart);
router.post('/cart/add', authenticateToken, addToCart);
router.put('/cart/update', authenticateToken, updateCart);
router.delete('/cart/remove/:productId', authenticateToken, removeFromCart);

router.get('/orders', authenticateToken, getOrders);
router.post('/orders/checkout', authenticateToken, checkout);

router.get('/wishlist', authenticateToken, getWishlist);
router.post('/wishlist/add', authenticateToken, addToWishlist);
router.delete('/wishlist/remove/:productId', authenticateToken, removeFromWishlist);

router.get('/buylater', authenticateToken, getBuyLater);
router.post('/buylater/add', authenticateToken, addToBuyLater);
router.delete('/buylater/remove/:productId', authenticateToken, removeFromBuyLater);
router.post('/buylater/move-to-cart/:productId', authenticateToken, moveToCart);

export default router;
