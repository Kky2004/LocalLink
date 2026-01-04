import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Search, Star, MapPin, Clock, Shield, Users } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { reviewService } from "../Service/reviewService";


export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [providerRatings, setProviderRatings] = useState({});

  // Load services on mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        const { serviceService } = await import("../Service/serviceService");
        const data = await serviceService.getAllServices();
        setAllServices(data);

        // Fetch ratings for each unique provider
        const ratingsMap = {};
        const uniqueProviders = [...new Set(allServices.map((s) => s.providerId))];

        await Promise.all(
          uniqueProviders.map(async (providerId) => {
            const ratingData = await reviewService.getProviderRating(providerId);
            ratingsMap[providerId] = ratingData; // { averageRating, totalReviews }
          })
        );

        setProviderRatings(ratingsMap);
      } catch (error) {
        console.error("Failed to load services:", error);
      }
    };

    loadServices();
  }, []);

  const handleSearchInputChange = (value) => {
    setSearchQuery(value);

    if (value.trim().length > 0) {
      const filtered = allServices
        .filter(
          (service) =>
            service?.name?.toLowerCase().includes(value.toLowerCase()) ||
            service?.category?.toLowerCase().includes(value.toLowerCase()) ||
            service?.description?.toLowerCase().includes(value.toLowerCase()) ||
            service?.providerName?.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (service) => {
    setShowSuggestions(false);

    if (!user) {
      navigate("/login");
    } else if (user?.userType?.toUpperCase() !== "CONSUMER") {
      toast.warning("Only consumers can book service.");
    } else {
      navigate(`/booking/${service?.providerId}?serviceId=${service?.id}`);
    }
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);

    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/search");
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target.closest(".home-search-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const serviceCategories = [
    {
      category: "electrical",
      name: "Electrical",
      URL: "/media/electrical.jpg",
      description: "Professional electrical services for your home",
    },
    {
      category: "plumbing",
      name: "Plumbing",
      URL: "/media/plumbing.webp",
      description: "Expert plumbing solutions and repairs",
    },
    {
      category: "cleaning",
      name: "Cleaning",
     URL:"/media/cleaning.webp",
      description: "Thorough cleaning services for your space",
    },
    {
      category: "pest-control",
      name: "Pest Control",
      URL:"/media/pest-control.jpg",
      description: "Professional pest elimination and prevention",
    },
    {
      category: "carpentry",
      name: "Carpentry",
      URL:"/media/carpentry.jpg",
      description: "Custom woodwork and repairs",
    },
    {
      category: "appliance-repair",
      name: "Appliance Repair",
      URL:"/media/appliance.webp",
      description: "Fix all your home appliances",
    },
  ];

  // Get featured providers from actual services
  const featuredProviders = React.useMemo(() => {
    if (allServices.length === 0) return [];

    // Group services by provider and pick top providers
    const providerMap = new Map();
    allServices.forEach((service) => {
      if (!providerMap.has(service.providerId)) {

        const ratingInfo =
        providerRatings[service.providerId] || {
          averageRating: 0,
          totalReviews: 0,
        };

        providerMap.set(service.providerId, {
          id: service.providerId,
          name: service.providerName,
          service: service.category,
          rating: ratingInfo.averageRating, // Random rating 4.5-5.0
          reviews: ratingInfo.totalReviews, // Random 50-150 reviews
          location: service.serviceArea?.split(",")[0] || "India",
          hourlyRate: service.price,
          verified: true,
          image: service.images || "https://via.placeholder.com/150",
        });
      }
    });

    return Array.from(providerMap.values()).slice(0, 3);
  }, [allServices,providerRatings]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#f7f8fa] text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl mb-6 font-semibold font-body">
             Your home.Our responsibility.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-black max-w-3xl mx-auto font-body">
              Connect with verified professionals in your area for all your home
              service needs. From electrical work to cleaning, we've got you
              covered.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto home-search-container">
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-4 mb-4"
              >
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#000000]" />
                  <input 
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim() && suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    className=" text-[#000000] w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                      {suggestions.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleSuggestionClick(service)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                        >
                          {service.images && (
                            <img
                              src={service.images}
                              alt={service.name}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate font-body">
                              {service.name}
                            </p>
                            <p className="text-sm text-gray-600 truncate font-body">
                              by {service.providerName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-primary-100 text-black font-body rounded-full">
                                {service.category}
                              </span>
                              <span className="text-sm font-semibold text-black">
                                ₹{service.price}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-body">
              Popular Service Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Browse through our comprehensive list of home services and find
              exactly what you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((service) => (
              <Link
                key={service.category}
                to={`/search?category=${service.category}`}
                className="group p-6  rounded-lg  hover:border-primary-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="text-center ">
                  <div className="text-4xl mb-4 flex justify-center "><img src={service.URL} alt="" className=" w-[320px] h-[200px] object-cover rounded-lg"  /></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-600">
                    {service.name}
                  </h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Top-Rated Service Providers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet our highest-rated professionals who consistently deliver
              exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl font-bold text-black">
                    {provider.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                    <div>
                      <h3 className=" ml-8 text-lg font-semibold text-gray-900">
                        {provider.name}
                      </h3>
                      <p className= "ml-8 text-gray-600">{provider.service}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-gray-900 font-semibold">
                        {provider.rating}
                      </span>
                      <span className="ml-1 text-gray-500">
                        ({provider.reviews} reviews)
                      </span>
                    </div>
                    {provider.verified && (
                      <Shield className="h-5 w-5 text-green-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {provider.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />₹{provider.hourlyRate}
                      /hr
                    </div>
                  </div>

                  <Link
                    to={`/provider/${provider.id}`}
                    className="block w-full bg-black text-white text-center py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/search"
              className="inline-flex items-center px-6 py-3 border border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors"
            >
              View All Providers
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How LocalLink Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0f0f0f] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Search
              </h3>
              <p className="text-gray-600">
                Find the service you need and browse through verified providers
                in your area
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#0f0f0f] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Book</h3>
              <p className="text-gray-600">
                Choose your preferred provider and schedule a service at your
                convenience
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#0f0f0f] rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rate</h3>
              <p className="text-gray-600">
                After service completion, rate your experience and help others
                make informed decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}
