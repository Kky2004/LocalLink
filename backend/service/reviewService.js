const Review =require("../models/reviewModel");
const Booking =require("../models/bookingModel");
const User =require("../models/userModel");

// Create Review
exports.createReview = async (consumerEmail, bookingId, rating, comment) => {
  // Get consumer by email
  const consumer = await User.findOne({ email: consumerEmail });
  if (!consumer) {
    throw new Error("Consumer not found");
  }

  // Check if review already exists for this booking
  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    throw new Error("Review already exists for this booking");
  }

  // Get booking
  const booking = await Booking.findById(bookingId)
    .populate("providerId consumerId");

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Ensure user reviewing is same consumer
  if (booking.consumerId.toString() !== consumer._id.toString()) {
    throw new Error("You can only review your own bookings");
  }

  // Create review
  const review = await Review.create({
    bookingId,
    consumerId: consumer._id,
    providerId: booking.providerId,
    rating,
    comment,
  });

  return review;
};

// Get provider reviews
exports.getProviderReviews = async (providerId) => {
  return await Review.find({ providerId });
};

// Get provider average rating
exports.getProviderAverageRating = async (providerId) => {
  const reviews = await Review.find({ providerId });

  if (!reviews.length) return 0.0;

  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return avg;
};
