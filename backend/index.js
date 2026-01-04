const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const db_url = process.env.MONGO_URL; 
const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes=require("./routes/authRoute");
const userRoutes=require("./routes/userRoute");
const serviceRoutes=require("./routes/serviceRoute");
const reviewRoutes=require("./routes/reviewRoute");
const reportRoutes=require("./routes/reportRoute");
// const messageRoutes=require("./routes/messageRoute");
const bookingRoutes=require("./routes/bookingRoute");
const paymentRoutes=require("./routes/paymentRoute");



main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(db_url, {
    ssl: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 5000,
    
  });
}

const user=require("./routes/userRoute");

// Middleware
// ✅ CORS CONFIG (IMPORTANT FOR PHONE)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://172.27.234.120:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
// app.use("/api/messages", messageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

// Server Start
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
