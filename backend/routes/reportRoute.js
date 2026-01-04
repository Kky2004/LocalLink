const express =require("express");
const { createReport, getMyReports } =require("../controllers/reportController");
const  authMiddleware  = require("../middleware/authMiddleware");

const router = express.Router();

// Protected routes
router.post('/', authMiddleware, createReport);
router.get('/my-reports', authMiddleware, getMyReports);

module.exports = router;
