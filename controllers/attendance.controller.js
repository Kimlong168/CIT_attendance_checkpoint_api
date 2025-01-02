const Attendance = require("../models/attendance.model");
const User = require("../models/user.model");
const QRCode = require("../models/qrCode.model");
const LeaveRequest = require("../models/leaveRequest.model");
const axios = require("axios");
const ipRangeCheck = require("ip-range-check");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const { sendTelegramMessage } = require("../utils/sendTelegramMessage");
const {
  getFormattedTimeWithAMPM,
  getFormattedDate,
} = require("../utils/getFormattedDate");

const getAllAttendance = async (req, res, next) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate({
        path: "employee",
        select: "name email",
      })
      .populate({
        path: "qr_code",
        select: "location",
      })
      .exec();
    successResponse(res, attendanceRecords, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const getAttendanceById = async (req, res, next) => {
  try {
    const attendanceRecord = await Attendance.findById(req.params.id)
      .populate({
        path: "employee",
        select: "name email",
      })
      .populate({
        path: "qr_code",
        select: "location",
      })
      .exec();
    successResponse(res, attendanceRecord, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const getAttendanceByEmployeeId = async (req, res, next) => {
  try {
    const attendanceRecords = await Attendance.find({
      employee: req.params.id,
    })
      .populate({
        path: "employee",
        select: "name email",
      })
      .populate({
        path: "qr_code",
        select: "location",
      })
      .sort({ date: -1 }) // Sort by latest date first
      .exec();

    if (!attendanceRecords) {
      return errorResponse(
        res,
        "No attendance records found for this employee",
        404
      );
    }

    return successResponse(
      res,
      attendanceRecords,
      "Data retrieved successfully."
    );
  } catch (err) {
    next(err);
  }
};

const checkInAttendance = async (req, res, next) => {
  try {
    const { qr_code, check_in_status, checkInLateDuration, employee, time_in } =
      req.body;

    // check if the employee has already checked in for the day
    const existingAttendance = await Attendance.findOne({
      employee: employee,
      date: new Date().toDateString(),
    });

    if (existingAttendance) {
      return errorResponse(res, "You have already checked in for the day", 403);
    }

    // Verify the QR code location matches
    const qrCode = await QRCode.findById(qr_code);
    if (!qrCode) {
      return errorResponse(res, "QR Code not found", 404);
    }

    // Validate that the employee's wifi network is within a valid range of the QR code location
    const userIp = req.ip;
    const allowedNetworkRanges = qrCode.allowedNetworkRanges.map(
      (range) => range.ip
    );

    if (!ipRangeCheck(userIp, allowedNetworkRanges)) {
      const wifiNames = qrCode.allowedNetworkRanges
        .map((range) => range.wifiName)
        .join(", ");

      return errorResponse(
        res,
        `Access denied. You must be connected to the correct Wi-Fi network (${wifiNames})!`,
        403
      );
    }

    const attendance = new Attendance({
      employee: employee,
      date: new Date().toDateString(), // Records the date in string format (only date, no time)
      time_in: new Date(time_in),
      qr_code: qr_code,
      check_in_status: check_in_status,
    });

    if (check_in_status === "Late") {
      attendance.checkInLateDuration = checkInLateDuration;
    }

    const result = await attendance.save();

    const employeeData = await User.findById(employee);

    await sendTelegramMessage(
      `*Attendance Check In* 🟩
      \n🆔 ID: \`${result._id}\`
      \n👤 Employee: ${employeeData.name} (${employeeData.role})
      \n💰 Time In: ${getFormattedTimeWithAMPM(time_in)}
      \n📅 Date: ${getFormattedDate(new Date())}
      \n🔖 Status: ${
        check_in_status === "Late"
          ? check_in_status + " 🔴"
          : check_in_status + " 🟢"
      }` + (checkInLateDuration ? `\n\n⏲️ Late: ${checkInLateDuration}` : ""),
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_ATTENDANCE_ID
    );

    successResponse(res, attendance, "Attendance recorded successfully.");
  } catch (err) {
    next(err);
  }
};

const checkOutAttendance = async (req, res, next) => {
  const {
    qr_code,
    employee,
    check_out_status,
    checkOutEarlyDuration,
    time_out,
    lat,
    lon,
  } = req.body;
  try {
    // const attendance = await Attendance.findById(req.params.id);
    // find by employee and date
    const attendance = await Attendance.findOne({
      employee: employee,
      date: new Date().toDateString(),
    });

    if (!attendance) {
      return errorResponse(res, "Attendance record not found", 404);
    }

    //  check if the employee has already checked out for the day
    if (attendance.time_out) {
      return errorResponse(
        res,
        "You have already checked out for the day",
        403
      );
    }

    console.log("location", lat, lon);

    const employeeData = await User.findById(employee);

    let isRemoteCheckout = false;

    const qrCode = await QRCode.findById(qr_code);
    if (!qrCode) {
      return errorResponse(res, "QR Code not found", 404);
    }

    // Validate that the employee's wifi network is within a valid range of the QR code location
    const userIp = req.ip;
    const allowedNetworkRanges = qrCode.allowedNetworkRanges.map(
      (range) => range.ip
    );

    if (!ipRangeCheck(userIp, allowedNetworkRanges)) {
      // check if the employee is allowed to check out remotely
      if (employeeData.isAllowedRemoteCheckout) {
        isRemoteCheckout = true;

        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

        const response = await axios.get(url);

        if (response.data.display_name) {
          // Extract the display_name from the response
          const displayName = response.data.display_name;

          attendance.location = displayName;
          console.log("displayName", displayName);
        } else {
          console.log("No results found for the location.");
        }
      } else {
        const wifiNames = qrCode.allowedNetworkRanges
          .map((range) => range.wifiName)
          .join(", ");

        return errorResponse(
          res,
          `Access denied. You must be connected to the correct Wi-Fi network (${wifiNames})!`,
          403
        );
      }
    }

    attendance.time_out = time_out ? new Date(time_out) : attendance.time_out;
    attendance.check_out_status =
      check_out_status || attendance.check_out_status;
    attendance.isRemoteCheckout = isRemoteCheckout;

    if (check_out_status === "Early Check-out") {
      attendance.checkOutEarlyDuration = checkOutEarlyDuration;
    }

    const result = await attendance.save();

    await sendTelegramMessage(
      `*Attendance Check Out ${
        isRemoteCheckout ? `(Remotely: ${result.location})` : ""
      }* 🟥
      \n🆔 ID: \`${result._id}\`
      \n👤 Employee: ${employeeData.name} (${employeeData.role})
      \n💰 Time Out: ${getFormattedTimeWithAMPM(time_out)}
      \n📅 Date: ${getFormattedDate(new Date())}
      \n🔖 Status: ${
        check_out_status === "Early Check-out"
          ? check_out_status + " 🔴"
          : check_out_status + " 🟢"
      }` +
        (checkOutEarlyDuration ? `\n\n⏲️ Early: ${checkOutEarlyDuration}` : ""),
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_ATTENDANCE_ID
    );

    successResponse(res, attendance, "Attendance updated successfully.");
  } catch (err) {
    next(err);
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    successResponse(res, null, "Attendance record deleted successfully.");
  } catch (err) {
    next(err);
  }
};

const recordAttendanceAbsentOrOnLeave = async () => {
  try {
    const employees = await User.find({
      role: { $in: ["user"] },
    });
    for (const employee of employees) {
      const attendance = await Attendance.findOne({
        employee: employee._id,
        date: new Date().toDateString(),
      });

      // if no attendance record for the day, then record as absent or on leave
      if (!attendance) {
        // check if on leave (leave request approved)
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Midnight
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of the day
        const leaveRequest = await LeaveRequest.findOne({
          employee: employee._id,
          start_date: { $lte: endOfDay }, // Start date should be before or equal to today
          end_date: { $gte: startOfDay }, // End date should be after or equal to today
          status: "Approved",
        });

        // if on leave, then record attendance as "On Leave"
        if (leaveRequest) {
          const attendance = new Attendance({
            employee: employee._id,
            date: new Date().toDateString(),
            check_in_status: "On Leave",
            check_out_status: "On Leave",
          });
          console.log("success");
          await attendance.save();
        } else {
          // if not on leave, then absent
          const attendance = new Attendance({
            employee: employee._id,
            date: new Date().toDateString(),
            check_in_status: "Absent",
            check_out_status: "Absent",
          });

          await attendance.save();
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const recordAttendanceMissCheckout = async () => {
  try {
    const employees = await User.find({
      role: { $in: ["user"] },
    });

    for (const employee of employees) {
      const attendance = await Attendance.findOne({
        employee: employee._id,
        date: new Date().toDateString(),
      });

      // check if missed check out
      if (
        attendance &&
        !attendance.time_out &&
        attendance.check_in_status !== "Absent" &&
        attendance.check_in_status !== "On Leave"
      ) {
        attendance.check_out_status = "Missed Check-out";
        await attendance.save();
      }
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getAllAttendance,
  getAttendanceById,
  checkInAttendance,
  checkOutAttendance,
  deleteAttendance,
  recordAttendanceAbsentOrOnLeave,
  recordAttendanceMissCheckout,
  getAttendanceByEmployeeId,
};
