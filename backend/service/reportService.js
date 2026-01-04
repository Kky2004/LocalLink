const Report =require("../models/reportModel");

// Create a report
exports.createReport = async (reporterId, reportedUserId, reportType, description, bookingId) => {
  const report = new Report({
    reporterId,
    reportedUserId,
    reportType,
    description,
    bookingId,
    status: "PENDING",
  });

  await report.save();
  return report;
};

// Get all reports created by logged-in user
exports.getMyReports = async (userId) => {
  return await Report.find({ reporterId: userId });
};
