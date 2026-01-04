const express =require("express");
const {
  createReview,
  getProviderReviews,
  getProviderRating
} =require("../controllers/reviewController");
const  authMiddleware  =require("../middleware/authMiddleware");

const router = express.Router();

// Protected route: only logged-in users can create review
router.post('/', authMiddleware, createReview);

// Public routes
router.get('/provider/:providerId', getProviderReviews);
router.get('/provider/:providerId/rating', getProviderRating);

module.exports=router;
