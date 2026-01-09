import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { Cashfree } from 'cashfree-pg'; 
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

dotenv.config();

// 1. Initialize SDKs
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
console.log("CURRENT KEY:", process.env.RAZORPAY_KEY_ID);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- CASHFREE CONFIG FIX ---
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
// Fix: Use string "SANDBOX" instead of the Enum which is undefined in Node 22
Cashfree.XEnvironment = "SANDBOX"; 


// --- STRIPE LOGIC ---
const getStripeKey = asyncHandler(async (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

const createStripeIntent = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  if (!amount) {
    res.status(400);
    throw new Error("Amount is required");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
  });
  res.send({ clientSecret: paymentIntent.client_secret });
});

// --- RAZORPAY LOGIC ---
const createRazorpayOrder = asyncHandler(async (req, res) => {
  
  try{
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    const amountInPaise = Math.round(amount*100);
  const options = {
    amount: amountInPaise, 
    currency: "INR",
    // receipt: "order_rcptid_11"
    receipt: `receipt_${Date.now()}`, // unique receipt recommended
     
  };
  const order = await razorpay.orders.create(options);
  
  res.json({
      id: order.id,
       // send valid session token
      currency: order.currency,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID
    });
} catch (error) {
    console.error("Razorpay Error:", error.message);
    res.status(500).json({ message: "Razorpay order creation failed" });
  }
});

// --- CASHFREE LOGIC ---
const createCashfreeOrder = asyncHandler(async (req, res) => {
  const { amount, customerId, customerPhone, customerName } = req.body;
  
  // Random Order ID to prevent duplicates during testing
  const orderId = `ORDER_${Date.now()}`;

  const request = {
    order_amount: amount,
    order_currency: "INR",
    order_id: orderId,
    customer_details: {
      customer_id: customerId || "cust_001",
      customer_phone: customerPhone || "9999999999",
      customer_name: customerName || "Guest"
    },
    order_meta: {
      return_url: `http://localhost:3000/order/success?order_id=${orderId}`
    }
  };

  try {
    const response = await Cashfree.PGCreateOrder("2022-09-01", request);
    res.json(response.data);
  } catch (error) {
    console.error("Cashfree Error:", error.response?.data?.message || error.message);
    res.status(500).json({ message: "Cashfree creation failed" });
  }
});

export { 
  getStripeKey, 
  createStripeIntent, 
  createRazorpayOrder, 
  createCashfreeOrder 
};