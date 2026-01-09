import express from 'express';
import { 
  getStripeKey, 
  createStripeIntent, 
  createRazorpayOrder, 
  createCashfreeOrder 
} from '../controllers/paymentController.js';

const router = express.Router();

// Stripe
router.get('/config/stripe', getStripeKey);
router.post('/create-payment-intent', createStripeIntent);

// Razorpay
router.post('/razorpay-order', createRazorpayOrder);

// Cashfree
router.post('/cashfree-order', createCashfreeOrder);

export default router;