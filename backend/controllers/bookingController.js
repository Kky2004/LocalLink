const Booking =require("../models/bookingModel");

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

// Create Booking
exports.createBooking = async (req, res) => {
  try {
    const consumer = req.user;
    const data = req.body;

    const booking = await Booking.create({
      consumer: consumer._id,
      provider: data.providerId,
      service: data.serviceId,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      address: data.address,
      description: data.description,
      price: data.price,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Get bookings depending on role
exports.getAllBookings = async (req, res) => {
  try {
    const user = req.user;
    let bookings;

    if (user.userType === "PROVIDER") {
      bookings = await Booking.find({ provider: user._id })
        .populate("consumer provider service");
    } else {
      bookings = await Booking.find({ consumer: user._id })
        .populate("consumer provider service");
    }

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Consumer bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ consumer: req.user._id })
      .populate("provider service");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Provider bookings
exports.getMyOrders = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate("consumer service");
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("consumer provider service");

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Booking Status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = status;

    if (status === BookingStatus.COMPLETED) {
      booking.completedAt = new Date();
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Payment Status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.query;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.paymentStatus = paymentStatus;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    const user = req.user;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Allow cancel only if pending or confirmed
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      return res
        .status(400)
        .json({ error: "Cannot cancel booking in current status" });
    }

    // Only consumer can cancel
    if (booking.consumer.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to cancel booking" });
    }

    booking.status = BookingStatus.CANCELLED;
    await booking.save();

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
