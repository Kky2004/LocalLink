import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../Context/AuthContext";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  Shield,
  Briefcase,
} from "lucide-react";


export default function ProviderProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadProviderData(id);
    }
  }, [id]);

  const loadProviderData = async (providerId) => {
    try {
      const { serviceService } = await import("../Service/serviceService");
      const { reviewService } = await import("../Service/reviewService");

      //Load services
      const servicesData = await serviceService.getServicesByProvider(
        providerId
      );
      setServices(servicesData);

      //  Load Ratings + Reviews
      const ratingData = await reviewService.getProviderRating(providerId);

      //  Extract Provider Info
      let providerInfo = {
        id: providerId,
        name: "Provider",
        email: "",
        phone: "",
        userType: "PROVIDER",
        approved: true,
        createdAt: new Date().toISOString(),
        rating: ratingData?.averageRating || 0,
        reviews: ratingData?.totalReviews || 0,
      };

      if (servicesData.length > 0) {
        const firstService = servicesData[0];
        setProvider({
          id: firstService.providerId || providerId,
          name: firstService.providerName || "Provider",
          email: firstService.providerEmail || "",
          phone: firstService.providerPhone || "",
          userType: "provider",
          approved: true,
          createdAt: new Date().toISOString(),
          rating: ratingData?.averageRating || 0,
          reviews: ratingData?.totalReviews || 0,
        });
      } else {
        setProvider({
          id: providerId,
          name: "Provider",
          email: "",
          phone: "",
          userType: "provider",
          approved: true,
          createdAt: new Date().toISOString(),
          rating: 0,
          reviews: 0,
        });
      }

      setLoading(false);
    } catch (err) {
      console.error("Failed to load provider data:", err);
      setError("Failed to load provider information");
      setLoading(false);
    }
  };

  const handleBookService = (service) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.userType?.toUpperCase() !== "CONSUMER") {
      toast.warning("Only consumers can book services");
      return;
    }

    navigate(`/booking/${service.providerId}?serviceId=${service.id}`);
  };

  const handleMessageProvider = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/messages?user=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading provider profile...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Provider Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The provider you are looking for does not exist."}
          </p>
          <button
            onClick={() => navigate("/search")}
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
        {/* Provider Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl font-bold text-black">
                    {provider.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Provider Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                      {provider.name}
                    </h1>
                    {provider.approved && (
                      <span className="inline-flex shrink-0 items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                        <Shield className="h-4 w-4 mr-1" />
                        Verified Provider
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3">
                    <div className="flex items-center shrink-0">
                    {[...Array(5)].map((_, i) => {
                      const filled = i < Math.round(provider?.rating || 0);
                      return (
                        <Star
                          key={i}
                          className={`h-4 w-4 sm:h-5 sm:w-5  ${
                            filled
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      );
                    })}
                    </div>

                    <span className="text-sm sm:text-base text-gray-700 font-semibold">
                      {provider?.rating?.toFixed(1) || 0}
                    </span>

                    <span className="text-sm text-gray-500 break-words">
                      ({provider?.reviews || 0} reviews)
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-gray-600">
                    <div className="flex items-center shrink-0">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{services.length} Services</span>
                    </div>

                    <div className="flex items-center shrink-0">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Member since{" "}
                        {new Date(provider.createdAt).getFullYear()}
                      </span>
                    </div>
                  </div>

                 

                  {provider?.phone ? (
                    <div className="flex items-center mt-3 text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{provider.phone}</span>
                    </div>
                  ) : null}

                

                  {provider?.email ? (
                    <div className="flex items-center mt-1 text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{provider.email}</span>
                    </div>
                  ) : null}

                </div>
              </div>

             
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
          <p className="text-gray-600 leading-relaxed">
            Professional service provider with years of experience...
          </p>
        </div>

        {/* Services */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Services Offered
          </h2>

          {services.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Services Available
              </h3>
              <p className="text-gray-600">
                This provider hasn't added any services yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/service/${service.id}`)}
                >
                  {service.images ? (
                    <img
                      src={service.images}
                      alt={service.name}
                      className="w-full h-60 object-cover  rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <Briefcase className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {service.name}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-primary-100 text-black text-xs rounded-full">
                      {service.category}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{service.price}
                      </span>
                      <span className="text-gray-600 ml-1 text-sm">
                        /
                        {service.priceType === "hourly"
                          ? "hour"
                          : service.priceType}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookService(service);
                      }}
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600 font-medium text-sm"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ProviderProfile.propTypes = {};
