import  { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { Search as SearchIcon, Filter, Star, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const serviceCategories = [
    { category: 'electrical', name: 'Electrical',URL:"/media/electrical-icon.jpg" },
    { category: 'plumbing', name: 'Plumbing',URL:"/media/plumbing-icon.png" },
    { category: 'cleaning', name: 'Cleaning', URL:"/media/cleaning-icon.jpg" },
    { category: 'pest-control', name: 'Pest Control', URL:"/media/pest-control-icon.jpg" },
    { category: 'carpentry', name: 'Carpentry', URL:"/media/carpentry-icon.webp" },
    { category: 'appliance-repair', name: 'Appliance Repair',URL:"/media/appliance-icon.png" },
    { category: 'hvac', name: 'HVAC', URL:"/media/hvac-icon.avif" },
    { category: 'roofing', name: 'Roofing', URL:"/media/roofing-icon.jpg" }
  ];

  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    setSearchQuery(query);
    setSelectedCategory(category);

    loadServices();
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const { serviceService } = await import('../Service/serviceService');
      const data = await serviceService.getAllServices();
      setServices(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load services:', error);
      setServices([]);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    setSearchParams(params);
  };

  const handleSearchInputChange = (value) => {
    setSearchQuery(value);

    if (value.trim().length > 0) {
      const filtered = services
        .filter(
          (service) =>
            service.name?.toLowerCase().includes(value.toLowerCase()) ||
            service.category?.toLowerCase().includes(value.toLowerCase()) ||
            service.description?.toLowerCase().includes(value.toLowerCase()) ||
            service.providerName?.toLowerCase().includes(value.toLowerCase())
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
      navigate('/login');
    } else if (user.userType?.toUpperCase() !== 'CONSUMER') {
      toast.warning('Only consumers can book services.');
    } else {
      navigate(`/booking/${service.providerId}?serviceId=${service.id}`);
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setMinRating(0);
  };

  const filteredServices = services.filter((service) => {
    const matchesQuery =
      !searchQuery ||
      service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.providerName?.toLowerCase().includes(searchQuery.toLowerCase());

    const normalizeCategory = (cat) => cat.toLowerCase().replace(/[-_]/g, '');
    const matchesCategory =
      !selectedCategory ||
      normalizeCategory(service.category || '') === normalizeCategory(selectedCategory);

    const matchesMinPrice = !priceRange.min || service.price >= parseInt(priceRange.min);
    const matchesMaxPrice = !priceRange.max || service.price <= parseInt(priceRange.max);

    return matchesQuery && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  return (
     <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Service Providers
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl search-container">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for services or providers..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim() && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
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
                          <p className="font-medium text-gray-900 truncate">{service.name}</p>
                          <p className="text-sm text-gray-600 truncate">by {service.providerName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full">
                              {service.category}
                            </span>
                            <span className="text-sm font-semibold text-primary-600">₹{service.price}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-500 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Category Cards - Show when no category selected */}
        {!selectedCategory && !searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {serviceCategories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                 className="bg-white rounded-lg shadow-md p-2  hover:shadow-xl transition-all hover:-translate-y-1 text-center"
                >
                  <div className="text-5xl mb-2"><img src={cat.URL} alt="" className=" w-[150px] h-[150px] object-cover rounded-lg mx-auto block"/></div>
                  <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Category Header */}
        {selectedCategory && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {serviceCategories.find(c => c.category === selectedCategory)?.icon}{' '}
                {serviceCategories.find(c => c.category === selectedCategory)?.name} Services
              </h2>
            </div>
            <button
              onClick={() => setSelectedCategory('')}
              className="text-black hover:text-primary-700 font-medium"
            >
              ← Back to Categories
            </button>
          </div>
        )}

        {/* Results */}
        <div className="w-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {loading ? 'Loading...' : `${filteredServices.length} services found`}
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                   Finding services near you...
                </h3>
                <p className="text-gray-600">
                  Please wait while we locate services in your area
                </p>
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="space-y-4">
                {filteredServices.map((service) => (
                  <div key={service.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row items-start">
                      {service.images ? (
                        <img
                          src={service.images}
                          alt={service.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover mb-3 sm:mb-0 sm:mr-4"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                            <p className="text-gray-600">by {service.providerName}</p>
                            <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-black text-xs rounded-full">
                              {service.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-black">₹{service.price}</span>
                            <span className="text-sm text-gray-500">
                              {service.priceType === 'HOURLY' ? '/hour' : service.priceType === 'FIXED' ? 'fixed' : ''}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span className="font-medium">4.8</span>
                              {/* <span className="ml-1">(24 reviews)</span> */}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/provider/${service.providerId}`;
                              }}
                              className="flex items-center text-black hover:text-primary-700 font-medium"
                            >
                              by {service.providerName}
                            </button>
                            <div className="flex items-center text-green-600">
                              <Shield className="h-4 w-4 mr-1" />
                              Verified
                            </div>
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user) {
                                navigate('/login');
                              } else if (user.userType?.toUpperCase() !== 'CONSUMER') {
                                toast.warning('Only consumers can book services. Providers cannot book services.');
                              } else {
                                navigate(`/booking/${service.providerId}?serviceId=${service.id}`);
                              }
                            }}
                            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <SearchIcon className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

