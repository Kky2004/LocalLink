const Service = require("../models/serviceModel");
const User = require("../models/userModel");

/**
 * Create a new service
 */
exports.createService = async (providerId, data) => {
  const provider = await User.findById(providerId);
  if (!provider) throw new Error('Provider not found');
  if (provider.userType !== 'PROVIDER') throw new Error('Only providers can create services');

  const service = new Service({
    name: data.name,
    category: data.category,
    description: data.description,
    price: data.price,
    priceType: data.priceType,
    images: data.images,
    serviceArea: data.serviceArea,
    latitude: data.latitude,
    longitude: data.longitude,
    serviceRadius: data.serviceRadius ?? 5,
    provider: provider._id,
  });

  const savedService = await service.save();
  return mapToResponse(savedService, provider);
};

/**
 * Get all services
 */
exports.getAllServices = async () => {
  const services = await Service.find().populate('provider');
  return services.map(s => mapToResponse(s, s.provider));
};

/**
 * Get services by provider
 */
exports.getServicesByProvider = async (providerId) => {
  const services = await Service.find({ provider: providerId }).populate('provider');
  return services.map(s => mapToResponse(s, s.provider));
};

/**
 * Get services by category
 */
exports.getServicesByCategory = async (category) => {
  const services = await Service.find({ category }).populate('provider');
  return services.map(s => mapToResponse(s, s.provider));
};

/**
 * Get service by ID
 */
exports.getServiceById = async (serviceId) => {
  const service = await Service.findById(serviceId).populate('provider');
  if (!service) throw new Error('Service not found');
  return mapToResponse(service, service.provider);
};

/**
 * Search services by location within a radius (km)
 */
exports.searchServicesByLocation = async (lat, lon, radius = 5, category) => {
  let query = {};
  if (category) query.category = category;

  const services = await Service.find(query).populate('provider');

  return services
    .filter(s => s.latitude != null && s.longitude != null && 
      calculateDistance(lat, lon, s.latitude, s.longitude) <= radius)
    .map(s => mapToResponse(s, s.provider));
};

/**
 * Update a service
 */
exports.updateService = async (serviceId, providerId, data) => {
  const service = await Service.findById(serviceId);
console.log("SERVICE.PROVIDER:", service.provider);
console.log("REQ.USER._ID:", providerId);
   if (!service) {
    throw new Error("Service not found");
  }

  if (!service.provider) {
    throw new Error("Service has no provider assigned");
  }

  
  if (service.provider.toString() !== providerId.toString()) {
    throw new Error("Unauthorized to update this service");
  }

  Object.assign(service, {
    name: data.name,
    category: data.category,
    description: data.description,
    price: data.price,
    priceType: data.priceType,
    serviceArea: data.serviceArea,
    latitude: data.latitude,
    longitude: data.longitude,
    serviceRadius: data.serviceRadius ?? 5
  });

  const updatedService = await service.save();
  return mapToResponse(updatedService);
};

/**
 * Delete a service
 */
exports.deleteService = async (serviceId, providerId) => {
  const service = await Service.findById(serviceId);

  if (!service) throw new Error('Service not found');
  if (service.provider.toString() !== providerId.toString()){
     throw new Error('Unauthorized to delete this service');
  }

  await service.deleteOne();
  console.log("SERVICE DELETED SUCCESSFULLY");
};

/**
 * Map Mongoose Service doc to response
 */
const mapToResponse = (service, provider) => ({
  id: service.id,
  name: service.name,
  category: service.category,
  description: service.description,
  price: service.price,
  priceType: service.priceType,
  images: service.images,
  providerId: provider.id,
  providerName: provider.name,
  serviceArea: service.serviceArea,
  latitude: service.latitude,
  longitude: service.longitude,
  serviceRadius: service.serviceRadius
});

/**
 * Haversine formula to calculate distance between coordinates in km
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => deg * (Math.PI / 180);
