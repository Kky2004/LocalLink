import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../Context/AuthContext";
import { Calendar, Clock, Star } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to access your dashboard
          </h1>
        </div>
      </div>
    );
  }

  if (user.userType?.toUpperCase() === "PROVIDER") {
    return <ProviderDashboard user={user} />;
  }

  return <ConsumerDashboard user={user} />;
}

/* ----------------------
  Consumer Dashboard
------------------------*/
const ConsumerDashboard = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { bookingService } = await import("../Service/bookingService");
      const bookingsData = await bookingService.getMyBookings();
      setBookings(bookingsData || []);

      const api = (await import("../Service/api")).default;
      const statsResponse = await api.get(
        "/users/dashboard/stats?userType=CONSUMER"
      );
      setStats(statsResponse.data);

      setLoading(false);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setBookings([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name || user.email.split("@")[0]}!
            </h1>
          </div>
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 place-items-center">
          <div className="bg-white rounded-lg  p-6 w-full max-w-lg shadow-md   hover:shadow-xl transition-all hover:-translate-y-0 ">
            <div
              onClick={() => navigate("/my-bookings")}
              className="cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-xl font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalBookings || 0}
                </p>
              </div>

              <img
                className="h-12 w-12"
                src="/media/calender-icon.png"
                alt=""
              />
            </div>
          </div>

          <div className="bg-white rounded-lg  p-6 w-full max-w-lg shadow-md   hover:shadow-xl transition-all hover:-translate-y-0">
            <div
              onClick={() => navigate("/my-bookings")}
              className="cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-xl font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.pendingBookings || 0}
                </p>
              </div>
              <img className="h-12 w-12" src="/media/pending-icon.png" alt="" />
            </div>
          </div>

          <div className="bg-white rounded-lg  p-6 w-full max-w-lg shadow-md   hover:shadow-xl transition-all hover:-translate-y-0">
            <div
              onClick={() => navigate("/my-bookings")}
              className="cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-xl font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.confirmedBookings || 0}
                </p>
              </div>
              <img className="h-12 w-12" src="/media/confirm-icon.png" alt="" />
            </div>
          </div>

          <div className="bg-white rounded-lg  p-6 w-full max-w-lg shadow-md   hover:shadow-xl transition-all hover:-translate-y-0">
            <div
              onClick={() => navigate("/my-bookings")}
              className="cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-xl font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.completedBookings || 0}
                </p>
              </div>
              <img
                className="h-12 w-12"
                src="/media/completed-icon.webp"
                alt=""
              />
            </div>
          </div>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 place-items-center">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg  p-6 w-full max-w-lg border-2 border-green-200 shadow-md   hover:shadow-xl transition-all hover:-translate-y-0">
            <div className="flex items-center justify-between mb-2 ">
              <p className="text-2xl font-bold text-green-800">Total Paid</p>
              <p className="text-4xl font-bold text-green-900">
                ₹{stats?.totalSpent?.toFixed(0) || "0"}
              </p>
            </div>

            <p className="text-md text-green-700 mt-1">
              Successfully completed payments
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 w-full max-w-lg border-2 border-red-200 shadow-md   hover:shadow-xl transition-all hover:-translate-y-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-2xl font-bold text-red-800"> Payment Due</p>
              <p className="text-4xl font-bold text-red-900">
                ₹{stats?.pendingPayments?.toFixed(0) || "0"}
              </p>
            </div>

            <p className="text-sm text-red-700 mt-1">
              You need to pay this amount
            </p>
            {stats?.pendingPayments > 0 && (
              <button
                onClick={() => (window.location.href = "/my-bookings")}
                className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-semibold shadow-lg"
              >
                Pay ₹{stats?.pendingPayments?.toFixed(0)} Now
              </button>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow  mx-auto">
          <div className="p-6  border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Bookings
            </h2>
          </div>
          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No bookings yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Start by searching for services
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 px-4 sm:px-6 md:px-8">
                      <div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold font-body text-gray-900">
                          {booking.service.name}
                        </h3>
                        <p className="text-sm sm:text-md text-gray-600">
                          {booking.provider.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          <Clock className="inline h-4 w-4 mr-1" />
                          {new Date(booking.scheduledDate).toLocaleDateString("en-IN")} at {booking.scheduledTime}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap  ${
                          booking.status.toLowerCase() === "completed"
                            ? "bg-green-100 text-green-800"
                            : booking.status.toLowerCase() === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : booking.status.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ConsumerDashboard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string.isRequired,
    userType: PropTypes.string,
  }).isRequired,
};

/* ----------------------
  Provider Dashboard
------------------------*/
const ProviderDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { bookingService } = await import("../Service/bookingService");
      const ordersData = await bookingService.getMyOrders();
      setOrders(ordersData || []);

      const api = (await import("../Service/api")).default;
      const statsResponse = await api.get(
        "/users/dashboard/stats?userType=PROVIDER"
      );
      setStats(statsResponse.data);

      setLoading(false);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setOrders([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-black text-3xl font-bold">
              Welcome back, {user.name || user.email.split("@")[0]}!
            </h1>
          </div>
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2  gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6  w-full max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalBookings || 0}
                </p>
              </div>
              <img
                className="h-12 w-12"
                src="/media/calender-icon.png"
                alt=""
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6  w-full max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats?.pendingBookings || 0}
                </p>
              </div>
              <img className="h-12 w-12" src="/media/pending-icon.png" alt="" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6  w-full max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.completedBookings || 0}
                </p>
              </div>
              <img className="h-12 w-12" src="/media/confirm-icon.png" alt="" />
            </div>
          </div>


          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.averageRating?.toFixed(1) || "0.0"}
                </p>
              </div>
              <Star className="h-10 w-10 text-yellow-500 fill-current" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats?.totalReviews || 0} reviews
            </p>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-2xl font-medium text-green-800">
                {" "}
                Total Earnings Received
              </p>
              <p className="text-3xl font-bold text-green-900">
                ₹{stats?.totalEarnings?.toFixed(0) || "0"}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-2xl font-medium text-blue-800">
                {" "}
                Pending Credits
              </p>
              <p className="text-3xl font-bold text-blue-900">
                ₹{stats?.pendingPayments?.toFixed(0) || "0"}
              </p>
            </div>

            <p className="text-sm text-blue-700 mt-1">
              Will be credited after customer payment
            </p>
            <p className="text-xs text-blue-600 mt-2">
              From completed orders awaiting payment
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Orders
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Orders will appear here when customers book your services
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.consumer?.name ?? "Unknown Customer"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.service?.name ?? "Unknown Service"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.scheduledDate).toLocaleDateString("en-IN")}
                        <br />
                        {order.scheduledTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => navigate("/orders")} className="text-primary-600 hover:text-primary-900 mr-3">
                          View
                        </button>
                        {order.status === "pending" && (
                          <button className="text-green-600 hover:text-green-900">
                            Accept
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProviderDashboard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string.isRequired,
    userType: PropTypes.string,
  }).isRequired,
};
