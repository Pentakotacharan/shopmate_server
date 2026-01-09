import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

// Route: /api/cart
// Description: Create a new order (Checkout) & Get logged-in user's orders
router.route('/')
    .post(protect, addOrderItems);

router.route('/myorders')
    .get(protect, getMyOrders);

// Route: /api/cart/:id
// Description: Get details of a specific order
router.route('/:id')
    .get(protect, getOrderById);

export default router;