const mongoose =require("mongoose");

const  Schema  = mongoose.Schema;

const paymentSchema = new Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
});

module.exports = mongoose.model("Payment", paymentSchema);


