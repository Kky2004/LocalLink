const express =require("express");
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getMyOrders,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  cancelBooking
} =require("../controllers/bookingController");
const  authMiddleware  =require("../middleware/authMiddleware");

const router = express.Router();

// All routes protected
router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getAllBookings);
router.get('/my-bookings', authMiddleware, getMyBookings);
router.get('/my-orders', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/status', authMiddleware, updateBookingStatus);
router.put('/:id/payment-status', authMiddleware, updatePaymentStatus);
router.delete('/:id', authMiddleware, cancelBooking);

module.exports = router;
