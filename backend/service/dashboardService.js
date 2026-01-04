const Booking =require("../models/bookingModel.js");
const Payment =require("../models/paymentModel.js");
const Review =require("../models/reviewModel.js");
const User =require("../models/userModel.js");

exports.getConsumerStats = async (consumerEmail) => {
  const consumer = await User.findOne({ email: consumerEmail });
  if (!consumer) throw new Error("Consumer not found");

  const bookings = await Booking.find({ consumer: consumer._id }).populate("service");

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === "PENDING").length,
    confirmedBookings: bookings.filter(b => b.status === "CONFIRMED").length,
    completedBookings: bookings.filter(b => b.status === "COMPLETED").length,
    cancelledBookings: bookings.filter(b => b.status === "CANCELLED").length,
    totalSpent: 0,
    pendingPayments: 0
  };

  let totalSpent = 0;
  let pendingPayments = 0;

  for (const booking of bookings) {
    const payment = await Payment.findOne({ bookingId: booking._id });

    if (payment && payment.status === "COMPLETED") {
      totalSpent += payment.amount;
    } 
    else if (booking.status === "COMPLETED" || booking.status === "CONFIRMED") {
      const amount = booking?.service?.price || 0;
      const platformFee = amount * 0.10;
      pendingPayments += (amount + platformFee);
    }
  }

  stats.totalSpent = totalSpent;
  stats.pendingPayments = pendingPayments;

  return stats;
};



exports.getProviderStats = async (providerEmail) => {
  const provider = await User.findOne({ email: providerEmail });
  if (!provider) throw new Error("Provider not found");

  const bookings = await Booking.find({ provider: provider._id }).populate("service");

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === "PENDING").length,
    confirmedBookings: bookings.filter(b => b.status === "CONFIRMED").length,
    completedBookings: bookings.filter(b => b.status === "COMPLETED").length,
    cancelledBookings: bookings.filter(b => b.status === "CANCELLED").length,
    totalEarnings: 0,
    pendingPayments: 0,
    averageRating: 0,
    totalReviews: 0
  };

  let totalEarnings = 0;
  let pendingPayments = 0;

  for (const booking of bookings) {
    if (booking.status === "COMPLETED") {
      const payment = await Payment.findOne({ bookingId: booking._id });
      const price = booking?.service?.price || 0;

      if (payment && payment.status === "COMPLETED") {
        totalEarnings += price * 0.9;   // Provider gets 90%
      } else {
        pendingPayments += price * 0.9;
      }
    }
  }

  stats.totalEarnings = totalEarnings;
  stats.pendingPayments = pendingPayments;

  // Provider Ratings
  const reviews = await Review.find({ providerId: provider._id });

  if (reviews.length > 0) {
    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    stats.averageRating = avg;
    stats.totalReviews = reviews.length;
  }

  return stats;
};
