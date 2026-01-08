import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../Context/AuthContext";
import { Calendar, Clock, MapPin, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showBookDetail, setShowBookDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleCancelBooking = async (bookingId) => {
    const result = await Swal.fire({
      title: "Cancel Booking?",
      text: "Are you sure you want to cancel this booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;

    try {
      const { bookingService } = await import("../Service/bookingService");
      await bookingService.cancelBooking(bookingId);
      loadBookings();
    } catch (error) {
      // toast.error("Failed to cancel booking");
      Swal.fire({
        icon: "error",
        title: "Failed to cancel booking",
      });
    }
  };

  const handlePayment = async (booking) => {
    const serviceAmount = booking.price || booking.totalAmount || 0;
    const platformFee = Math.round(serviceAmount * 0.05);
    const totalAmount = serviceAmount + platformFee;

    try {
      const { paymentService } = await import("../Service/paymentService");
      const order = await paymentService.createOrder({
        bookingId: booking._id,
        amount: totalAmount,
      });

      const razorpayKey =
        import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_ID";

      const options = {
        key: razorpayKey,
        amount: order.amount * 100,
        currency: "INR",
        name: "LocalLink",
        description: `Payment for ${booking.serviceName}`,
        order_id: order.razorpayOrderId,
        handler: async function (response) {
          try {
            const { bookingService } = await import(
              "../Service/bookingService"
            );
            await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            await bookingService.updatePaymentStatus(booking._id, "COMPLETED");
            // ✅ UPDATE UI STATE IMMEDIATELY
            setBookings((prev) =>
              prev.map((b) =>
                b._id === booking._id
                  ? {
                      ...b,
                      paymentStatus: "COMPLETED",
                      paymentAmount: totalAmount,
                    }
                  : b
              )
            );

            const providerAmount = serviceAmount;

            Swal.fire({
              icon: "success",
              title: "Payment Successful!",
              html: `
              <p><b>Transaction ID:</b> ${response.razorpay_payment_id}</p>
              <p><b>Service Amount:</b> ₹${serviceAmount}</p>
              <p><b>Platform Fee:</b> ₹${platformFee}</p>
              <p><b>Total Paid:</b> ₹${totalAmount}</p>
              <p><b>Provider Receives:</b> ₹${providerAmount}</p>
              <p>Thank you for using LocalLink!</p>
            `,
              confirmButtonText: "Okay",
            }).then((result) => {
              if (result.isConfirmed) {
                handleShowFeedback(booking);
              }
            });

            loadBookings();
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: "#4F46E5" },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
          },
        },
        notes: {
          service_amount: serviceAmount,
          platform_fee: platformFee,
          provider_amount: serviceAmount,
        },
      };
      if (!window.Razorpay) {
        toast.warning("Razorpay SDK failed to load. Please refresh the page.");
        return;
      }
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  const handleReportNoShow = async (bookingId) => {
    const reason = prompt(
      "Please describe what happened:\n(e.g., Provider didn't arrive, No response, etc.)"
    );
    if (!reason || reason.trim() === "") {
      toast.info("Please provide details about the issue");
      return;
    }

    const confirmReportIssue = async (reason) => {
      const result = await Swal.fire({
        title: "Report this issue?",
        html: `
      <p><strong>Reason:</strong> ${reason}</p>
      <p>This will cancel the booking and notify support.</p>
    `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Report",
        cancelButtonText: "No",
        confirmButtonColor: "#e11d48",
        cancelButtonColor: "#6b7280",
      });
    };

    if (!(await confirmReportIssue(reason))) return;

    try {
      const { bookingService } = await import("../Service/bookingService");
      await bookingService.updateBookingStatus(bookingId, "CANCELLED");
      toast.success(
        "Issue reported successfully. Our support team will contact you shortly.\nBooking has been cancelled."
      );
      loadBookings();
    } catch (error) {
      console.error("Failed to report issue:", error);
      toast.error("Failed to report issue");
    }
  };

  const handleReportIssue = async (booking) => {
    const reportTypes = [
      { value: "POOR_SERVICE", label: "Poor Service Quality" },
      { value: "UNPROFESSIONAL_CONDUCT", label: "Unprofessional Behavior" },
      { value: "INAPPROPRIATE_BEHAVIOR", label: "Inappropriate Behavior" },
      { value: "HARASSMENT", label: "Harassment" },
      { value: "FRAUD", label: "Fraud or Scam" },
      { value: "SAFETY_CONCERN", label: "Safety Concern" },
      { value: "OTHER", label: "Other Issue" },
    ];

    const { value: typeIndex } = await Swal.fire({
      title: "Select Report Type",
      input: "select",
      inputOptions: reportTypes.reduce((obj, type, index) => {
        obj[index] = type.label;
        return obj;
      }, {}),
      inputPlaceholder: "Choose a reason",
      showCancelButton: true,
      confirmButtonText: "Next",
      cancelButtonText: "Cancel",
    });

    if (typeIndex === undefined) return;

    const selectedType = reportTypes[Number(typeIndex)];

    const { value: details } = await Swal.fire({
      title: `Report: ${selectedType.label}`,
      input: "textarea",
      inputLabel: "Please provide detailed information",
      inputPlaceholder:
        "- What happened?\n- When did it occur?\n- Any evidence or witnesses?",
      inputAttributes: {
        rows: 6,
      },
      showCancelButton: true,
      confirmButtonText: "Next",
    });

    if (!details || !details.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Details Required",
        text: "Please provide issue details",
      });
      return;
    }

    // 3️⃣ Final Confirmation
    const confirm = await Swal.fire({
      title: "Submit Report?",
      html: `
      <p><b>Type:</b> ${selectedType.label}</p>
      <p><b>Against:</b> ${booking.providerName}</p>
      <p>This report will be reviewed by our support team and appropriate action will be taken.</p>
    `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Submit Report",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    Swal.fire({
      icon: "success",
      title: "Report Submitted",
      text: "Our support team will review your report shortly.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleShowFeedback = async (booking) => {
    try {
      // 1️⃣ Get Rating
      const { value: rating } = await Swal.fire({
        title: "Rate Your Experience",
        input: "number",
        inputLabel: "Give rating between 1–5",
        inputAttributes: {
          min: 1,
          max: 5,
          step: 1,
        },
        inputValidator: (value) => {
          if (!value || value < 1 || value > 5)
            return "Please enter a rating between 1 and 5";
        },
        confirmButtonText: "Next",
        showCancelButton: true,
      });

      if (!rating) return;

      // 2️⃣ Get Review Text
      const { value: feedback } = await Swal.fire({
        title: "Write Your Review",
        input: "textarea",
        inputPlaceholder:
          "How was the service?\nWas the provider professional?\nWould you recommend them?",
        showCancelButton: true,
      });

      if (!feedback) return;

      // 3️⃣ Submit to Backend
      const { reviewService } = await import("../Service/reviewService");
      await reviewService.createReview({
        bookingId: booking._id,
        rating: Number(rating),
        comment: feedback,
      });

      // 4️⃣ Success Popup
      Swal.fire({
        icon: "success",
        title: "Thank You!",
        html: `
        <b>Rating:</b> ${"⭐".repeat(rating)}<br/>
        Your review helps others and will appear soon.
      `,
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Failed to submit review:", error);

      Swal.fire({
        icon: "error",
        title: "Review Failed",
        text:
          error?.response?.data?.message ||
          "You may have already reviewed this booking.",
      });
    }
  };

  useEffect(() => {
    if (!user || user.userType?.toUpperCase() !== "CONSUMER") {
      navigate("/dashboard");
      return;
    }
    loadBookings();
  }, [user, navigate]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { bookingService } = await import("../Service/bookingService");
      const data = await bookingService.getMyBookings();
      console.log(data);

      const bookingsWithPayments = await Promise.all(
        (data || []).map(async (booking) => {
          if (booking.status.toLowerCase() === "completed") {
            try {
              const { paymentService } = await import(
                "../Service/paymentService"
              );
              const payment = await paymentService.getPaymentByBookingId(
                booking._id
              );
              return {
                ...booking,
                paymentStatus: payment.status,
                paymentAmount: payment.amount,
                paidAt: payment.paidAt,
              };
            } catch (error) {
              return booking;
            }
          }
          return booking;
        })
      );

      setBookings(bookingsWithPayments);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setBookings([]);
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  const serviceAmount = Number(
    selectedBooking?.price || selectedBooking?.totalAmount || 0
  );
  const platformFee = Math.round(serviceAmount * 0.05);
  const totalAmount = serviceAmount + platformFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            Manage and track your service bookings
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "all"
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "pending"
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "confirmed"
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "completed"
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === "all"
                ? "You haven't made any bookings yet"
                : `No ${filter} bookings`}
            </p>
            <button
              onClick={() => navigate("/search")}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              Find Services
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow "
              >
                <div className=" p-6 grid grid-cols-1">
                  <div className="flex justify-between items-start mb-4 ">
                    <div className="flex-1">
                      <h3 className="md:text-xl font-semibold text-gray-900 mb-1">
                        Service: {booking.service.name}
                      </h3>
                      <p className="text-gray-600">
                        <b>Provider:</b> {booking.provider.name}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                    {/* <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>{booking.scheduledTime}</span>
                    </div> */}
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{booking.address}</span>
                    </div>
                    {/* <div className="flex items-center text-gray-600">
                      <span className="font-semibold">
                        ₹{booking.price || booking.totalAmount || 0}
                      </span>
                    </div> */}
                  </div>

                  {booking.service.description && (
                    <p className="text-gray-600 mb-4 text-sm">
                      {booking.service.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 px-4 sm:px-6 md:px-12">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookDetail(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600 text-s"
                    >
                      View Details
                    </button>

                    {booking.status.toLowerCase() === "completed" && (
                      <>
                        {booking.paymentStatus === "COMPLETED" ? (
                          <div className="w-full sm:w-auto px-4 py-2 bg-green-100 text-green-800 rounded-md text-sm font-semibold flex items-center">
                            Payment Completed - ₹
                            {booking.paymentAmount ||
                              booking.price ||
                              booking.totalAmount ||
                              0}
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePayment(booking)}
                            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-semibold"
                          >
                            Pay Now ₹
                            {(booking.price || booking.totalAmount || 0) +
                              Math.round(
                                (booking.price || booking.totalAmount || 0) *
                                  0.05
                              )}
                          </button>
                        )}
                        <button
                          onClick={() => handleReportIssue(booking)}
                          className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          Report Issue
                        </button>
                      </>
                    )}

                    {booking.status.toLowerCase() === "confirmed" && (
                      <button
                        onClick={() => handleReportNoShow(booking._id)}
                        className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Provider Didn't Show Up
                      </button>
                    )}

                    {booking.status.toLowerCase() === "pending" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBookDetail && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Booking Details</h3>
              <button
                onClick={() => setShowBookDetail(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium">{selectedBooking.service.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium">{selectedBooking.provider.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(selectedBooking.scheduledDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{selectedBooking.address}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>₹{serviceAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-2">
                  <span>Total</span>
                  <span className="text-primary-600">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t">
              <button
                onClick={() => setShowBookDetail(false)}
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
