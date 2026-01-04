import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { useAuth } from '../Context/AuthContext';
import { Star, MapPin, Clock, MessageCircle, Calendar } from 'lucide-react';

export default function ServiceDetails  ()  {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadService(id);
    }
  }, [id]);

  const loadService = async (serviceId) => {
    try {
      const { serviceService } = await import('../Service/serviceService');
      const data = await serviceService.getServiceById(serviceId);
      setService(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load service:', err);
      setError('Failed to load service details');
      setLoading(false);
    }
  };

  const handleBookService = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.userType?.toUpperCase() !== 'CONSUMER') {
      toast.warning('Only consumers can book services');
      return;
    }
    navigate(`/booking/${service?.providerId}?serviceId=${service?.id}`);
  };

  const handleMessageProvider = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/messages?user=${service?.providerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The service you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <button onClick={() => navigate('/')} className="hover:text-primary-600">
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button onClick={() => navigate('/search')} className="hover:text-primary-600">
                Services
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900">{service.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Images */}
            <div className="bg-white rounded-lg shadow mb-6">
              {service.images ? (
                <img
                  src={service.images}
                  alt={service.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-500 text-lg">No image available</span>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                    {service.category}
                  </span>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-gray-600">4.8 (24 reviews)</span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              </div>
            </div>

            {/* Provider Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Provider</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-bold text-lg">
                      {service.providerName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{service.providerName}</h4>
                    <p className="text-gray-600">Professional Service Provider</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">4.9 • 156 reviews</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/provider/${service.providerId}`)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{service.price}
                  </span>
                  <span className="text-gray-600">
                    /{service.priceType === 'hourly' ? 'hour' : service.priceType?.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Usually responds within 2 hours</span>
                </div>
              </div>

              <div className="space-y-3">
                {user?.userType?.toUpperCase() === 'CONSUMER' && (
                  <button
                    onClick={handleBookService}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 font-semibold flex items-center justify-center"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Now
                  </button>
                )}
                
                <button
                  onClick={handleMessageProvider}
                  className="w-full bg-white text-gray-700 py-3 px-4 rounded-md border border-gray-300 hover:bg-gray-50 font-semibold flex items-center justify-center"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Message Provider
                </button>

                {!user && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">Sign in to book this service</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 font-semibold"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                {user?.userType?.toUpperCase() === 'PROVIDER' && (
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      You are a service provider. Only consumers can book services.
                    </p>
                  </div>
                )}
              </div>

              {/* Service Features */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">What's included</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                    Professional service
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                    Quality guarantee
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                    Customer support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

