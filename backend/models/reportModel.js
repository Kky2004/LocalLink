const mongoose =require("mongoose");

const  Schema  = mongoose.Schema;

const reportSchema = new Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportType: {
      type: String,
      enum: ["SPAM", "ABUSE", "OTHER"],
      required: true,
    }, // Adjust enum values as needed
    description: { type: String, required: true, maxlength: 2000 },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" }, // optional
    status: {
      type: String,
      enum: ["PENDING", "RESOLVED", "REJECTED"],
      default: "PENDING",
    },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    adminNotes: { type: String, maxlength: 1000 },
  },
  {
    timestamps: true, // optional: adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Report", reportSchema);
