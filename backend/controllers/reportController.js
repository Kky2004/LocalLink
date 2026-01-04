const Report =require("../models/reportModel");
const Booking =require("../models/bookingModel");

// Create a report
exports.createReport = async (req, res) => {
  try {
    const user = req.user; 
    const { reportedUserId, reportType, description, bookingId } = req.body;

    if (!reportedUserId || !reportType || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If booking is supplied, verify booking exists
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
    }

    // Prevent duplicate report for same booking by same user
    if (bookingId) {
      const existingReport = await Report.findOne({
        reporterId: user._id,
        bookingId,
      });

      if (existingReport) {
        return res
          .status(400)
          .json({ error: 'Report already submitted for this booking' });
      }
    }

    const report = new Report({
      reporterId: user._id,
      reportedUserId,
      reportType,
      description,
      bookingId,
      status: 'PENDING',
    });

    await report.save();
    res.status(201).json(report);

  } catch (error) {
    console.error('Report Create Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all reports by current logged-in user
exports.getMyReports = async (req, res) => {
  try {
    const user = req.user;

    const reports = await Report.find({ reporterId: user._id })
      .sort({ createdAt: -1 });

    res.json(reports);

  } catch (error) {
    console.error('Get Reports Error:', error);
    res.status(500).json({ error: error.message });
  }
};
