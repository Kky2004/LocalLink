const mongoose =require("mongoose");

const  Schema  = mongoose.Schema;

const serviceSchema = new Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'electrical',
      'plumbing',
      'cleaning',
      'pest-control',
      'gardening',
      'painting',
      'carpentry',
      'appliance-repair',
      'hvac',
      'roofing',
      'other'
    ],
  },
  description: { type: String, maxlength: 1000 },
  price: { type: Number, required: true },
  priceType: {
    type: String,
    required: true,
    enum: ['hourly', 'fixed', 'negotiable'],
  },
  images: { 
    type: String,
    default: "/media/home-service.png",
   },

  // Location fields
  serviceArea: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  serviceRadius: { type: Number, default: 5 }, // km

  // Reference to provider (User)
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true, // automatically adds createdAt and updatedAt
});

module.exports = mongoose.model("Service", serviceSchema);
