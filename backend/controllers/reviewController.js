const Review = require("../models/reviewModel");
const Booking =require("../models/bookingModel");
const User =require("../models/userModel");

// Create Review
exports.createReview = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    console.log(req.body);
    const { bookingId, rating, comment } = req.body;
    console.log(bookingId);

    // Ensure user exists (optional safety)
    const consumer = await User.findById(user._id);
    if (!consumer) return res.status(404).json({ error: "Consumer not found" });

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ error: "Review already exists for this booking" });
    }

    // Get booking to fetch provider & validate ownership
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Ensure only consumer of this booking can review
    if (booking.consumer.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "You can only review your own bookings" });
    }

    // Create review
    const review = await Review.create({
      bookingId,
      consumerId: user._id,
      providerId: booking.provider,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Get all reviews for a provider
exports.getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const reviews = await Review.find({ providerId });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get provider average rating
exports.getProviderRating = async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await Review.find({ providerId });
    if (!reviews.length)
      return res.json({ averageRating: 0, totalReviews: 0 });

    const totalReviews = reviews.length;
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    res.json({ averageRating, totalReviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
