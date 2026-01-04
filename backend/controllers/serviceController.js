
const {
 createService: serviceCreateService,
  getAllServices: serviceGetAllServices,
  getServiceById: serviceGetServiceById,
  getServicesByProvider: serviceGetServicesByProvider,
  getServicesByCategory: serviceGetServicesByCategory,
  searchServicesByLocation,
  updateService: serviceUpdateService,
  deleteService: serviceDeleteService,
} = require("../service/serviceService");

// Get all services
const getAllServices = async (req, res) => {
  try {
    const services = await serviceGetAllServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    const service = await serviceGetServiceById(req.params.id);
    res.json(service);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get services by provider
const getServicesByProvider = async (req, res) => {
  try {
    const services = await serviceGetServicesByProvider(
      req.params.providerId
    );
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all services by category
const getServicesByCategory = async (req, res) => {
  try {
    const services = await serviceGetServicesByCategory(
      req.params.category
    );
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search nearby
const searchNearby = async (req, res) => {
  try {
    const { latitude, longitude, radius, category } = req.query;
    const services = await searchServicesByLocation(
      Number(latitude),
      Number(longitude),
      Number(radius) || 5,
      category
    );
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create service
const createService = async (req, res) => {
  try {
    const user = req.user; // From auth middleware
    const service = await serviceCreateService(user._id, req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const user = req.user;
    console.log("REQ.USER:", req.user);
    const service = await serviceUpdateService(
      req.params.id,
      user._id,
      req.body
    );
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const user = req.user;
    await serviceDeleteService(req.params.id, user._id);


    return res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  getServicesByProvider,
  getServicesByCategory,
  searchNearby,
  createService,
  updateService,
  deleteService
};
