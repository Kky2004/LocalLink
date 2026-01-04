import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { useAuth } from '../Context/AuthContext';
import { Calendar,Clock,MapPin,Check,MessageCircle,X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

export default function Orders  ()  {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [providerRating, setProviderRating] = useState(null);

  useEffect(() => {
    if (!user || (user.userType || '').toUpperCase() !== 'PROVIDER') {
      navigate('/dashboard');
      return;
    }

    loadOrders();
    loadProviderRating();
  }, [user, navigate]);

  const loadProviderRating = async () => {
    if (!user) return;
    try {
      const { reviewService } = await import('../Service/reviewService');
      const rating = await reviewService.getProviderRating(user.id);
      setProviderRating(rating);
    } catch (error) {
      console.error('Failed to load rating:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const { bookingService } = await import('../Service/bookingService');
      const data = await bookingService.getMyOrders();

      const ordersWithPayments = await Promise.all(
        data.map(async (order) => {
          if (order.status?.toLowerCase() === 'completed') {
            try {
              const { paymentService } = await import('../Service/paymentService');
              const payment = await paymentService.getPaymentByBookingId(order._id);

              return {
                ...order,
                paymentStatus: payment.status,
                paymentAmount: payment.amount,
                paidAt: payment.paidAt,
              };
            } catch {
              return order;
            }
          }
          return order;
        })
      );

      setOrders(ordersWithPayments);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const { bookingService } = await import('../Service/bookingService');
      await bookingService.updateBookingStatus(orderId, 'CONFIRMED');
      toast.success('Order accepted!');
      loadOrders();
    } catch (error) {
      console.error('Failed to accept order:', error);
      toast.error('Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Please provide a reason for rejecting this order:');
    if (!reason?.trim()) {
      toast.warning('Rejection reason is required');
      return;
    }

    if (!window.confirm(`Reject order?\nReason: ${reason}`)) return;

    try {
      const { bookingService } = await import('../Service/bookingService');
      await bookingService.updateBookingStatus(orderId, 'CANCELLED');
      toast.error(`Order rejected. Reason: ${reason}`);
      loadOrders();
    } catch (error) {
      console.error('Failed to reject order:', error);
      toast.error('Failed to reject order');
    }
  };

  // const handleCompleteOrder = async (orderId) => {
  //   if (!window.confirm('Mark this order as completed?')) return;

  //   try {
  //     const { bookingService } = await import('../Service/bookingService');
  //     await bookingService.updateBookingStatus(orderId, 'COMPLETED');
  //     toast.success('Order marked as completed!');
  //     loadOrders();
  //   } catch (error) {
  //     console.error('Failed to complete order:', error);
  //     toast.error('Failed to complete order');
  //   }
  // };

  

const handleCompleteOrder = async (orderId) => {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to mark this order as COMPLETED?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Complete",
    cancelButtonText: "Cancel",
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    try {
      const { bookingService } = await import("../Service/bookingService");
      await bookingService.updateBookingStatus(orderId, "COMPLETED");

      Swal.fire({
        icon: "success",
        title: "Order Completed!",
        text: "The order has been successfully marked as completed.",
        confirmButtonText: "Ok",
      });
      loadOrders();
    } catch (error) {
      console.error("Failed to complete order:", error);

      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Failed to complete the order. Try again.",
      });
    }
  });
};


  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status?.toLowerCase() === filter.toLowerCase();
  });

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">Manage your service orders and bookings</p>
            </div>
            {providerRating && providerRating.totalReviews > 0 && (
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-yellow-500">
                    {providerRating.averageRating.toFixed(1)}
                  </span>
                  <span className="text-yellow-500 text-2xl">★</span>
                </div>
                <p className="text-sm text-gray-600">
                  {providerRating.totalReviews} review{providerRating.totalReviews !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500 mt-1">Your Rating</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-800">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">
              {orders.filter(o => o.status.toLowerCase() === 'pending').length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-800">Confirmed</p>
            <p className="text-2xl font-bold text-blue-900">
              {orders.filter(o => o.status.toLowerCase() === 'confirmed').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-800">Completed</p>
            <p className="text-2xl font-bold text-green-900">
              {orders.filter(o => o.status.toLowerCase() === 'completed').length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <p className="text-sm text-purple-800">Earnings</p>
            <p className="text-2xl font-bold text-purple-900">
              ₹{orders
                .filter(o => o.status.toLowerCase() === 'completed')
                .reduce((sum, o) => sum + o.price, 0)
                .toFixed(0)}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Paid: ₹{orders
                .filter(o => o.paymentStatus === 'COMPLETED')
                .reduce((sum, o) => sum + o.price, 0)
                .toFixed(0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pending'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'confirmed'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'completed'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? "You haven't received any orders yet"
                : `No ${filter} orders`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {order.serviceName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600">Customer: {order.consumer?.name ?? "Unknown Customer"}</p>
                      <p className="text-gray-500 text-sm">Phone: {order.consumer?.phone ?? "Unknown"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">₹{order.price}</p>
                      <p className="text-sm text-gray-500">OrderId #{order._id.substring(0, 8)}</p>
                      {order.paymentStatus === 'COMPLETED' && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                             Payment Received
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Amount to credit: ₹{order.price}
                          </p>
                        </div>
                      )}
                      {order.status.toLowerCase() === 'completed' && !order.paymentStatus && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                             Payment Pending
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Awaiting customer payment
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:grid sm:grid-cols-1  gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>{new Date(order.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>{order.scheduledTime}</span>
                    </div>
                    <div className="flex items-center text-gray-600 md:col-span-2">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{order.address}</span>
                    </div>
                  </div>

                  {order.description && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-1">Customer Notes:</p>
                      <p className="text-gray-600 text-sm">{order.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {(order.status === 'pending' || order.status === 'PENDING') && (
                      <>
                        <button
                          onClick={() => handleAcceptOrder(order._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept Order
                        </button>
                        <button
                          onClick={() => handleRejectOrder(order._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    {(order.status === 'confirmed' || order.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCompleteOrder(order._id)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                      >
                        Mark as Completed
                      </button>
                    )}
                    <button
                      onClick={() => handleReportCustomer(order)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                    >
                      Report Customer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

