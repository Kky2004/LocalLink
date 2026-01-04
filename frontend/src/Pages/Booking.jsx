import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { MapPin, User, FileText, CreditCard } from 'lucide-react';
import DateTimePicker from '../Components/DateTimePicker';
import { serviceService } from '../Service/serviceService';

export default function Booking  ()  {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    selectedDate: '',
    selectedTime: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (String(user.userType).toUpperCase() !== 'CONSUMER') {
      toast.warning(`Only consumers can book services. Your type: ${user.userType}`);
      navigate('/dashboard');
      return;
    }

    if (serviceId) {
      loadService(serviceId);
    } else {
      setLoading(false);
    }
  }, [user, serviceId, navigate]);

  const loadService = async (id) => {
    try {
      const data = await serviceService.getServiceById(id);
      setService(data);
      if (data.providerId) {
        loadProvider(data.providerId);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load service:', error);
      setLoading(false);
    }
  };

  const loadProvider = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/providers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProvider(data);
      }
    } catch (error) {
      console.error('Failed to load provider:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.selectedDate || !formData.selectedTime) {
      toast.warning('Please select both date and time');
      return;
    }
    if (!formData.address.trim()) {
      toast.warning('Please enter a service address');
      return;
    }

    setSubmitting(true);

    try {
      const { bookingService } = await import('../Service/bookingService');

      const bookingData = {
        serviceId: serviceId || '',
        providerId: providerId || '',
        scheduledDate: formData.selectedDate,
        scheduledTime: formData.selectedTime,
        address: formData.address,
        description: formData.notes,
        price: service?.price || 0,
      };

      await bookingService.createBooking(bookingData);
      toast.success('Booking created successfully!');
      navigate('/my-bookings');
    } catch (error) {
      console.error('Failed to create booking:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create booking. Please try again.';
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Service</h1>
          <p className="text-gray-600">Complete the form below to schedule your service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {provider && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Provider</h2>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{provider.name}</h3>
                      <p className="text-sm text-gray-600">{provider.email}</p>
                      <p className="text-sm text-gray-600">{provider.phone}</p>
                      <button
                        type="button"
                        onClick={() => navigate(`/provider/${provider.id}`)}
                        className="text-sm text-primary-black hover:text-gray-600 font-medium mt-1"
                      >
                        View Profile →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {service && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
                  <div className="flex items-start space-x-4">
                    {service.images ? (
                      <img
                        src={service.images}
                        alt={service.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.category}</p>
                      <p className="text-sm text-gray-500 mt-1">by {service.providerName}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{service.price}
                        </span>
                        <span className="text-gray-600 ml-1">
                          /{service.priceType === 'hourly' ? 'hour' : service.priceType.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h2>
                <DateTimePicker
                  selectedDate={formData.selectedDate}
                  selectedTime={formData.selectedTime}
                  onDateChange={(date) => setFormData({ ...formData, selectedDate: date })}
                  onTimeChange={(time) => setFormData({ ...formData, selectedTime: time })}
                  minDate={minDate}
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <MapPin className="inline h-5 w-5 mr-1" />
                  Service Location
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter the complete address where the service should be performed"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <FileText className="inline h-5 w-5 mr-1" />
                  Additional Information
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Any special requirements, access instructions, or additional details the provider should know"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-600 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              <div className="space-y-4">
                {service && (
                  <>
                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Service</p>
                      <p className="font-medium text-gray-900">{service.name}</p>
                    </div>

                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Provider</p>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                          <User className="h-4 w-4 text-black" />
                        </div>
                        <p className="font-medium text-gray-900">{service.providerName || 'Provider'}</p>
                      </div>
                    </div>
                  </>
                )}

                {formData.selectedDate && (
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(formData.selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {formData.selectedTime && (
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Time</p>
                    <p className="font-medium text-gray-900">
                      {(() => {
                        const [hours, minutes] = formData.selectedTime.split(':');
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayHour = hour % 12 || 12;
                        return `${displayHour}:${minutes} ${ampm}`;
                      })()}
                    </p>
                  </div>
                )}

                {service && (
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium text-gray-900">₹{service.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-medium text-gray-900">₹50</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-black">
                          ₹{(parseFloat(service.price.toString()) + 50).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-black">
                  <strong>Note:</strong> Your booking will be confirmed once the provider accepts it. 
                  You'll receive a notification when the status changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


