import { Router } from 'express';

import { login, profile, register } from '../controllers/auth.controller';
import {
  getFeed,
  getProductById,
  getProducts,
  getSkus,
  getProductRecommendations,
  getProductRecommendationRows,
} from '../controllers/catalog.controller';
import {
  createProductReview,
  getHome,
  getMobileOrders,
  getProductBySlug,
  getRecipeModules,
  getRegistryModules,
} from '../controllers/content.controller';
import { getHomeRowById } from '../controllers/homeRows.controller';
import { sendChatMessage, streamChat, chatHistory } from '../controllers/chat.controller';
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
import { healthCheck, readinessCheck } from '../controllers/health.controller';
import { uploadImage } from '../controllers/upload.controller';
import { recordProductView } from '../controllers/events.controller';
import {
  getSynthesizeAudioBackground,
  synthesizeAudio,
  synthesizeAudioBackground,
  transcribeAudio,
} from '../controllers/speech.controller';
import { authenticateOptional, authenticateToken } from '../middleware/authenticateToken';
import { requireAdmin } from '../middleware/requireAdmin';
import { upload, uploadRaw } from '../config/cloudinary';
import {
  getModels3D,
  uploadModel3D,
  updateModel3D,
  deleteModel3D,
} from '../controllers/model3D.controller';
import multer from 'multer';
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
  updateAdminOrder,
} from '../controllers/admin.controller';

const router = Router();
const speechUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.get('/health', healthCheck);
router.get('/ready', readinessCheck);
router.get('/smartcart/state', authenticateToken, getSmartCartState);
router.post('/login', login);
router.post('/register', register);
router.get('/profile', authenticateToken, profile);
router.post('/upload', authenticateToken, upload.single('image'), uploadImage);

router.get('/home', getHome);
router.get('/home/rows/:rowId', authenticateOptional, getHomeRowById);
router.post('/events/view', authenticateOptional, recordProductView);
router.get('/feed', getFeed);
router.get('/skus', getSkus);
router.get('/recipes', getRecipeModules);
router.get('/registries', getRegistryModules);
router.get('/products', getProducts);
router.get('/products/slug/:slug', getProductBySlug);
router.post('/products/:id/reviews', authenticateOptional, createProductReview);
router.get('/products/:id', getProductById);
router.get('/products/:id/recommendations', authenticateToken, getProductRecommendations);
router.get('/products/:id/recommendation-rows', authenticateOptional, getProductRecommendationRows);

router.post('/chat/message', authenticateOptional, sendChatMessage);
router.post('/chat/stream', authenticateOptional, streamChat);
router.get('/chat/history/:sessionId', authenticateOptional, chatHistory);
router.post('/speech/transcribe', authenticateOptional, speechUpload.single('audio'), transcribeAudio);
router.post('/speech/synthesize', authenticateOptional, synthesizeAudio);
router.post('/speech/synthesize/background', authenticateOptional, synthesizeAudioBackground);
router.get('/speech/synthesize/background/:jobId', authenticateOptional, getSynthesizeAudioBackground);

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
router.put('/admin/orders/:id', authenticateToken, requireAdmin, updateAdminOrder);
router.patch('/admin/orders/:id/status', authenticateToken, requireAdmin, updateAdminOrderStatus);

// 3D Model Routes (Admin)
router.get('/admin/models3d', authenticateToken, requireAdmin, getModels3D);
router.post('/admin/models3d/upload', authenticateToken, requireAdmin, uploadRaw.single('model'), uploadModel3D);
router.put('/admin/models3d/:id', authenticateToken, requireAdmin, updateModel3D);
router.delete('/admin/models3d/:id', authenticateToken, requireAdmin, deleteModel3D);

export default router;
