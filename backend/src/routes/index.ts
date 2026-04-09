import { Router } from 'express';

import { login, profile, register } from '../controllers/auth.controller';
import {
  getFeed,
  getProductById,
  getProducts,
  getSkus,
  getProductRecommendations,
} from '../controllers/catalog.controller';
import {
  getHome,
  getMobileOrders,
  getProductBySlug,
  getRecipeModules,
  getRegistryModules,
} from '../controllers/content.controller';
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCart,
  getSmartCartState,
} from '../controllers/cart.controller';
import { checkout, getOrderById, getOrders, getOrderTracking } from '../controllers/order.controller';
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
import { requireAdmin } from '../middleware/requireAdmin';
import { upload } from '../config/cloudinary';
import {
  adminLogin,
  createAdminProduct,
  deleteAdminProduct,
  getAdminDashboard,
  getAdminOrderById,
  getAdminOrders,
  getAdminProductById,
  getAdminProducts,
  updateAdminOrderStatus,
  updateAdminProduct,
} from '../controllers/admin.controller';

const router = Router();

router.get('/health', healthCheck);
router.get('/smartcart/state', authenticateToken, getSmartCartState);
router.post('/login', login);
router.post('/register', register);
router.get('/profile', authenticateToken, profile);
router.post('/upload', authenticateToken, upload.single('image'), uploadImage);

router.get('/home', getHome);
router.get('/feed', getFeed);
router.get('/skus', getSkus);
router.get('/recipes', getRecipeModules);
router.get('/registries', getRegistryModules);
router.get('/products', getProducts);
router.get('/products/slug/:slug', getProductBySlug);
router.get('/products/:id', getProductById);
router.get('/products/:id/recommendations', authenticateToken, getProductRecommendations);

router.get('/cart', authenticateToken, getCart);
router.post('/cart/add', authenticateToken, addToCart);
router.put('/cart/update', authenticateToken, updateCart);
router.delete('/cart/remove/:productId', authenticateToken, removeFromCart);

router.get('/orders', authenticateToken, getOrders);
router.get('/orders/mobile', authenticateToken, getMobileOrders);
router.get('/orders/:id', authenticateToken, getOrderById);
router.get('/orders/:id/tracking', authenticateToken, getOrderTracking);
router.post('/orders/checkout', authenticateToken, checkout);

router.get('/wishlist', authenticateToken, getWishlist);
router.post('/wishlist/add', authenticateToken, addToWishlist);
router.delete('/wishlist/remove/:productId', authenticateToken, removeFromWishlist);

router.get('/buylater', authenticateToken, getBuyLater);
router.post('/buylater/add', authenticateToken, addToBuyLater);
router.delete('/buylater/remove/:productId', authenticateToken, removeFromBuyLater);
router.post('/buylater/move-to-cart/:productId', authenticateToken, moveToCart);

router.post('/admin/login', adminLogin);
router.get('/admin/dashboard', authenticateToken, requireAdmin, getAdminDashboard);
router.get('/admin/products', authenticateToken, requireAdmin, getAdminProducts);
router.post('/admin/products', authenticateToken, requireAdmin, createAdminProduct);
router.get('/admin/products/:id', authenticateToken, requireAdmin, getAdminProductById);
router.put('/admin/products/:id', authenticateToken, requireAdmin, updateAdminProduct);
router.delete('/admin/products/:id', authenticateToken, requireAdmin, deleteAdminProduct);
router.get('/admin/orders', authenticateToken, requireAdmin, getAdminOrders);
router.get('/admin/orders/:id', authenticateToken, requireAdmin, getAdminOrderById);
router.patch('/admin/orders/:id/status', authenticateToken, requireAdmin, updateAdminOrderStatus);

export default router;
