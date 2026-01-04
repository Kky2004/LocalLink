const mongoose =require("mongoose");

const  Schema  = mongoose.Schema;

const bookingSchema = new Schema({
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
  },

  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, maxlength: 1000 },
  price: { type: Number, required: true },

  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  },

  rating: { type: Number, min: 0, max: 5 },
  review: { type: String, maxlength: 1000 },
}, {
  timestamps: true, // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model("Booking", bookingSchema);
