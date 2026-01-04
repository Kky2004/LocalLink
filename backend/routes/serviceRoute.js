const express = require("express");
const {
  searchNearby,
  getServicesByProvider,
  getServicesByCategory,
  getAllServices,
  getServiceById,
  createService,
  deleteService,
  updateService,
} = require("../controllers/serviceController");
const authMiddleware  = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/search/nearby", searchNearby); // keep this above dynamic routes
router.get("/provider/:providerId", getServicesByProvider);
router.get("/category/:category", getServicesByCategory);
router.get("/:id", getServiceById); // dynamic id route at the end
router.get("/", getAllServices); // general route at the end

// Protected routes
router.post("/", authMiddleware, createService);
router.put("/:id", authMiddleware, updateService);
router.delete("/:id", authMiddleware, deleteService);

module.exports = router;
