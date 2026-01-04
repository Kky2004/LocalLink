import  { useState,useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, MapPin } from 'lucide-react';

export default function AddServiceModal  ({ isOpen, onClose, onSubmit,service })  {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    priceType: 'HOURLY',
    serviceArea: '',
    serviceRadius: '5',
  });

  const [gettingLocation, setGettingLocation] = useState(false);


  useEffect(() => {
  if (service) {
    setFormData({
      name: service.name || '',
      category: service.category || '',
      description: service.description || '',
      price: service.price || '',
      priceType: service.priceType || 'hourly',
      serviceArea:service.serviceArea || '',
      serviceRadius:service.serviceRadius || '5',
    });
  } else {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      priceType: 'hourly',
      serviceArea:'',
      serviceRadius:'5',
    });
  }
}, [service]);

  const handleGetLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  setGettingLocation(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Reverse Geocoding API
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );

        const data = await response.json();

        const address = data.display_name || "Location found";

        setFormData((prev) => ({
          ...prev,
          latitude: lat.toString(),   // hidden usage
          longitude: lon.toString(),  // hidden usage
          locationName: address,      // human readable
        }));

        alert("Location captured successfully!");
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
        alert("Failed to fetch address from location");
      } finally {
        setGettingLocation(false);
      }
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("Please allow location access in browser settings");
      setGettingLocation(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};


  const handleSubmit = (e) => {
    e.preventDefault();
     if (service) {
    onSubmit({ ...formData, id: service.id });
  } else {
    onSubmit(formData);
  }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900"> {service ? 'Edit Service' : 'Add New Service'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Home Cleaning Service"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Category</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="cleaning">Cleaning</option>
                <option value="gardening">Gardening</option>
                <option value="pest-control">Pest-Control</option>
                <option value="painting">Painting</option>
                <option value="carpentry">Carpentry</option>
                <option value="appliance-repair">Appliance Repair</option>
                <option value="hvac">HVAC</option>
                <option value="roofing">Roofing</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your service..."
              />
            </div>

            {/* Price and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Type *
                </label>
                <select
                  value={formData.priceType}
                  onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="hourly">Per Hour</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>
            </div>

            {/* Service Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Area * (City/Area)
              </label>
              <input
                type="text"
                required
                value={formData.serviceArea}
                onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Mumbai, Andheri"
              />
            </div>

            {/* Location */}
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin className="inline h-6 w-6 mr-1" />
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:bg-gray-400"
                >
                  {gettingLocation ? 'Getting Location...' : ' Use My Location'}
                </button>
              </div>

              <div >
                <input
                  type="text"
                  step="any"
                  value={formData.locationName}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                  placeholder="Location will appear here"
                />
              </div>

              <p className="text-xs text-gray-600 mt-2">
                Click "Use My Location" to automatically fill your current GPS coordinates
              </p>
            </div>

            {/* Service Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Radius (km) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={formData.serviceRadius}
                onChange={(e) => setFormData({ ...formData, serviceRadius: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                How far are you willing to travel? 
              </p>
            </div>

            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-600"
              >
                 {service ? 'Update Service' : 'Add Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

AddServiceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  service: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    category: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    priceType: PropTypes.string,
    images: PropTypes.array,
    serviceArea: PropTypes.string,
    latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    serviceRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};


