const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    userType: {
      type: String,
      enum: ["CONSUMER", "PROVIDER"], 
      required: true,
    },

    approved: {
      type: Boolean,
      default: false,
    },

    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
  },

  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

module.exports = mongoose.model("User", UserSchema);
