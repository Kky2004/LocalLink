import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../Context/AuthContext";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddServiceModal from "../Components/AddServiceModal";

export default function MyServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (!user || user.userType?.toUpperCase() !== "PROVIDER") {
      navigate("/dashboard");
      return;
    }
    loadServices();
  }, [user, navigate]);

  const loadServices = async () => {
    try {
      const { serviceService } = await import("../Service/serviceService");
      const data = await serviceService.getServicesByProvider(user.id);
      console.log("Loaded services:", data);
      console.log("Loaded services:", data[0]);

      setServices(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load services:", error);
      setLoading(false);
    }
  };

  const handleAddService = async (formData) => {
    try {
      const { serviceService } = await import("../Service/serviceService");

      const serviceData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        priceType: formData.priceType,
        images: formData.images || undefined,
        serviceArea: formData.serviceArea,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude
          ? parseFloat(formData.longitude)
          : undefined,
        serviceRadius: parseInt(formData.serviceRadius) || 5,
      };

      console.log("Sending service data:", serviceData);
      await serviceService.createService(serviceData);
      toast.success("Service added successfully!");
      setShowAddModal(false);
      loadServices();
    } catch (error) {
      console.error("Failed to add service:", error);
      toast.error(
        `Failed to add service: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleUpdateService = async (formData) => {
    console.log("Updating service:", selectedService);
    try {
      if (!selectedService || !selectedService.id) {
        toast.error("No service selected to update");
        return;
      }
      const { serviceService } = await import("../Service/serviceService");

      const updatedData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        priceType: formData.priceType,
        images: formData.images || undefined,
        serviceArea: formData.serviceArea,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude
          ? parseFloat(formData.longitude)
          : undefined,
        serviceRadius: parseInt(formData.serviceRadius) || 5,
         providerId: selectedService.providerId,
      };

      await serviceService.updateService(selectedService.id, updatedData);

      toast.success("Service updated successfully!");
      setShowAddModal(false);
      setSelectedService(null);
      loadServices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update service");
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!serviceId) {
      toast.error("Service ID missing");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Service?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const { serviceService } = await import("../Service/serviceService");
      await serviceService.deleteService(serviceId);
      toast.success("Service deleted!");
      loadServices();
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Services
            </h1>
            <p className="text-gray-600">Manage your service offerings</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-black text-white px-6 py-2 rounded-md hover:bg-gray-600 flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Service
          </button>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No services yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by adding your first service to attract customers
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              Add Your First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                {service.images && service.images.length > 0 && (
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {service.name}
                    </h3>
                    <span className="px-2 py-1 bg-gray-200 text-primary-700 text-xs rounded-full">
                      {service.category}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-black">
                      <span className="text-xl font-bold">
                        ₹{service.price}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        /
                        {service.priceType === "hourly"
                          ? "hr"
                          : service.priceType}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        console.log("Selected service:", service);
                        setSelectedService(service);
                        setShowAddModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600 text-sm flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Service Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Add New Service
                </h2>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Home Cleaning"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                      <option value="">Select category</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="gardening">Gardening</option>
                      <option value="painting">Painting</option>
                      <option value="carpentry">Carpentry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe your service..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Type
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                        <option value="hourly">Per Hour</option>
                        <option value="fixed">Fixed Price</option>
                        <option value="negotiable">Negotiable</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-600"
                    >
                      Add Service
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* <AddServiceModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedService(null);
          }}
          onSubmit={selectedService ? handleUpdateService : handleAddService}
          service={selectedService}
        /> */}

        <AddServiceModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedService(null);
          }}
          onSubmit={(formData) => {
            if (selectedService) {
              handleUpdateService(formData);
            } else {
              handleAddService(formData);
            }
          }}
          service={selectedService}
        />
      </div>
    </div>
  );
}
