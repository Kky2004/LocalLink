const paymentService =require("../service/paymentService");

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ error: "bookingId and amount are required" });
    }

    console.log(`Creating order for booking: ${bookingId}, amount: ${amount}`);

    const payment = await paymentService.createOrder(bookingId, amount);
    res.status(201).json(payment);

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
};

// Verify Razorpay Payment
exports.verifyPayment = async (req, res) => {
  try {
    console.log("verify body",req.body);
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        error: "razorpayOrderId, razorpayPaymentId and razorpaySignature are required"
      });
    }

    const payment = await paymentService.verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
     console.log("VERIFY SUCCESS:", payment);

    res.json(payment);

  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(400).json({ error: error.message || "Verification failed" });
  }
};

// Get Payment By Booking ID
exports.getPaymentByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    const payment = await paymentService.getPaymentByBookingId(bookingId);
    res.json(payment);

  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(404).json({ error: error.message || "Payment not found" });
  }
};
