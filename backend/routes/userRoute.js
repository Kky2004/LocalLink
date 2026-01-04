const express = require("express");
// const auth = require("../middleware/authMiddleware");
const User = require("../models/userModel");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getCurrentUser,
  updateProfile,
  getDashboardStats,
} = require("../controllers/userController");

router.get("/me", authMiddleware, getCurrentUser);
router.put("/me", authMiddleware, updateProfile);
router.get("/dashboard/stats", authMiddleware, getDashboardStats);



module.exports = router;