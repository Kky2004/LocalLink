const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel"); // your mongoose model

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(bookingId, amount) {
    try {
      console.log("Creating Razorpay Order");
      console.log("Booking ID:", bookingId, "Amount:", amount);

      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // paise
        currency: "INR",
        receipt: bookingId, // must be <= 40 chars
      });

      console.log("Razorpay Order Created:", order.id);

      const payment = new Payment({
        bookingId,
        razorpayOrderId: order.id,
        amount,
        currency: "INR",
        status: "PENDING",
      });

      return await payment.save();
    } catch (err) {
      console.error("Razorpay Error:", err);
      throw new Error(
        `Razorpay API error: ${err.message}. Please check Razorpay credentials`
      );
    }
  }

  async verifyPayment(orderId, paymentId, signature) {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      throw new Error("Invalid payment signature");
    }

    const payment = await Payment.findOne({ razorpayOrderId: orderId });

    if (!payment) {
      throw new Error("Payment not found");
    }

    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature;
    payment.status = "COMPLETED";
    payment.paidAt = new Date();

    return await payment.save();
  }

  async getPaymentByBookingId(bookingId) {
    const payment = await Payment.findOne({ bookingId });

    if (!payment) {
      throw new Error(`Payment not found for booking: ${bookingId}`);
    }

    return payment;
  }
}

module.exports = new PaymentService();
