const User = require("../models/userModel");
const { getConsumerStats,getProviderStats} =require("../service/dashboardService.js");



// GET /users/me
exports.getCurrentUser = async (req, res) => {
  try {
    const email = req.user.email; // comes from auth middleware

    const user = await User.findOne({ email }).select("-password"); // don't send password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      token: req.token,   // optional if you want to send token like Spring
      user
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// PUT /users/me
exports.updateProfile = async (req, res) => {
  try {
    const email = req.user.email;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: req.body },
      { new: true }
    ).select("-password");

    res.json({
      token: req.token,   // optional
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getDashboardStats = async (req, res) => {
  try {
    const { userType } = req.query;
    const email = req.user.email; // Auth middleware sets req.user

    let stats;

    if (userType && userType.toUpperCase() === "PROVIDER") {
      stats = await getProviderStats(email);
    } else {
      stats = await getConsumerStats(email);
    }

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(400).json({ error: error.message });
  }
};