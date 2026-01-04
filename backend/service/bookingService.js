const Booking = require("../models/bookingModel");
const User = require("../models/userModel");
const Service = require("../models/serviceModel");

const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
};

const BookingService = {
  async createBooking(consumerId, data) {
    const consumer = await User.findById(consumerId);
    if (!consumer) throw new Error("Consumer not found");

    const provider = await User.findById(data.providerId);
    if (!provider) throw new Error("Provider not found");

    const service = await Service.findById(data.serviceId);
    if (!service) throw new Error("Service not found");

    const booking = await Booking.create({
      consumer,
      provider,
      service,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      address: data.address,
      description: data.description,
      price: data.price,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    return booking;
  },

  async getConsumerBookings(consumerId) {
    return await Booking.find({ consumer: consumerId })
      .populate("consumer provider service");
  },

  async getProviderBookings(providerId) {
    return await Booking.find({ provider: providerId })
      .populate("consumer provider service");
  },

  async getBookingById(bookingId) {
    const booking = await Booking.findById(bookingId)
      .populate("consumer provider service");

    if (!booking) throw new Error("Booking not found");
    return booking;
  },

  async updateBookingStatus(bookingId, status) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    booking.status = status;

    if (status === BookingStatus.COMPLETED) {
      booking.completedAt = new Date();
    }

    await booking.save();
    return booking;
  },

  async updatePaymentStatus(bookingId, paymentStatus) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    booking.paymentStatus = paymentStatus;
    await booking.save();
    return booking;
  },

  async cancelBooking(bookingId, userId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new Error("Cannot cancel booking in current status");
    }

    if (booking.consumer.toString() !== userId) {
      throw new Error("Unauthorized to cancel this booking");
    }

    booking.status = BookingStatus.CANCELLED;
    await booking.save();
  },
};

module.exports = BookingService;
