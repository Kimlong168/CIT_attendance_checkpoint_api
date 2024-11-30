const { successResponse, errorResponse } = require("../utils/responseHelpers");
const Attendance = require("../models/attendance.model");
const User = require("../models/user.model");
const { sendTelegramMessage } = require("../utils/sendTelegramMessage");
const {
  formatAttendanceReportForTelegram,
} = require("../utils/formatReportForTelegram");

const getAttendanceReport = async (req, res, next) => {
  try {
    let attendance = await Attendance.find()
      .populate({
        path: "employee",
        select: "name email",
      })
      .exec();

    // Filter based on query parameters
    if (req.query.date) {
      attendance = attendance.filter(
        (item) =>
          new Date(item.date).toDateString() ===
          new Date(req.query.date).toDateString()
      );
    }

    const data = {
      report_date: req.query.date,
      total_attendance: attendance.length,
      // all late employees
      late_employees: attendance.filter(
        (item) => item.check_in_status === "Late"
      ),

      // all early check out employees
      early_check_out_employees: attendance.filter(
        (item) => item.check_out_status === "Early Check-out"
      ),

      // all missed check out employees
      missed_check_out_employees: attendance.filter(
        (item) => item.check_out_status === "Missed Check-out"
      ),

      // all absent employees
      absent_employees: attendance.filter(
        (item) => item.check_in_status === "Absent"
      ),

      // all on leave employees
      on_leave_employees: attendance.filter(
        (item) => item.check_in_status === "On Leave"
      ),

      // all normal checked out employees
      normal_checked_out_employees: attendance.filter(
        (item) => item.check_out_status === "Checked Out"
      ),

      //on time employees
      on_time_employees: attendance.filter(
        (item) => item.check_in_status === "On Time"
      ),
    };

    // Handle API call
    if (req && res) {
      return successResponse(res, data, "Data retrieved successfully.");
    }

    // Return attendance for cron job
    return data;
  } catch (error) {
    // next(err);
    // Handle errors for API call
    if (req && res) {
      return errorResponse(res, error.message, 500);
    }

    // Use next if it's a valid function
    if (typeof next === "function") {
      return next(error);
    }

    throw error; // Throw for cron job
  }
};

const sendAttendanceReport = async (dateQuery) => {
  try {
    // Fetch the attendance data based on the date query
    const req = { query: { date: dateQuery } };
    const reportData = await getAttendanceReport(req);

    // Format the attendance data for the Telegram message
    const reportMessage = formatAttendanceReportForTelegram(reportData);

    // Send the attendance report to Telegram
    await sendTelegramMessage(
      reportMessage,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_ATTENDANCE_ID
    );
    console.log("Attendance report sent to Telegram");
  } catch (error) {
    console.error("Error sending attendance report:", error);
  }
};

const getAttendanceReportMonthly = async (req, res, next) => {
  try {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ); // Start of current month
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ); // End of current month

    let attendance = await Attendance.find({
      date: {
        $gte: startOfMonth, // Greater than or equal to start of the month
        $lte: endOfMonth, // Less than or equal to end of the month
      },
    }).populate({
      path: "employee",
      select: "name role",
    });

    const employees = await User.find({
      role: { $in: ["cashier", "inventoryStaff"] },
    }).select("name role email");

    const data = employees.map((employee) => {
      let attendanceData = {
        employee: employee,
        late: 0,
        earlyCheckOut: 0,
        missedCheckOut: 0,
        absent: 0,
        onLeave: 0,
        onTime: 0,
        normalCheckOut: 0,
      };

      attendance.forEach((item) => {
        if (item.employee._id.toString() === employee._id.toString()) {
          if (item.check_in_status === "Late") {
            attendanceData.late++;
          } else if (item.check_out_status === "Early Check-out") {
            attendanceData.earlyCheckOut++;
          } else if (item.check_out_status === "Missed Check-out") {
            attendanceData.missedCheckOut++;
          } else if (item.check_in_status === "Absent") {
            attendanceData.absent++;
          } else if (item.check_in_status === "On Leave") {
            attendanceData.onLeave++;
          } else if (item.check_in_status === "On Time") {
            attendanceData.onTime++;
          } else if (item.check_out_status === "Checked Out") {
            attendanceData.normalCheckOut++;
          }
        }
      });

      return attendanceData;
    });

    return successResponse(res, data, "Data retrieved successfully.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendanceReport,
  sendAttendanceReport,
  getAttendanceReportMonthly,
};
