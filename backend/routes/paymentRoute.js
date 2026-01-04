const express =require("express");
const  { createOrder, verifyPayment, getPaymentByBookingId } =require("../controllers/paymentController.js");
const  authMiddleware =require("../middleware/authMiddleware.js");

const router = express.Router();

// All routes can be protected
router.post('/create-order', authMiddleware, createOrder);
router.post('/verify', authMiddleware, verifyPayment);
router.get('/booking/:bookingId', authMiddleware, getPaymentByBookingId);

module.exports = router;
