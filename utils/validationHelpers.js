const { body, validationResult } = require("express-validator");

// Middleware to handle validation results
const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      error: {
        code: "VALIDATION_ERROR",
        message: errors
          .array()
          .map((err) => err.msg)
          .join(", "),
      },
    });
  }
  next();
};

// validation rules for user

const validateUserBody = () => {
  return [
    body("name").notEmpty().withMessage("Name is required."),
    // body("email")
    //   .notEmpty()
    //   .withMessage("Email is required.")
    //   .isEmail()
    //   .withMessage("Must be a valid email address."),
    // body("password").notEmpty().withMessage("Password is required."),
    body("role").notEmpty().withMessage("Role is required."),
    body("chat_id").optional().isString(),
  ];
};

// validation rules for QR Code
const validateQRCodeBody = () => {
  return [
    body("location")
      .notEmpty()
      .withMessage("Location is required.")
      .isString()
      .withMessage("Location must be a string."),
    body("workStartTime")
      .notEmpty()
      .withMessage("Work start time is required.")
      .isString()
      .withMessage("Work start time must be a string."),
    body("workEndTime")
      .notEmpty()
      .withMessage("Work end time is required.")
      .isString()
      .withMessage("Work end time must be a string."),

    body("allowedNetworkRanges.*.wifiName")
      .notEmpty()
      .withMessage("Wifi Name is required.")
      .isString()
      .withMessage("Wifi Name must be a string."),

    body("allowedNetworkRanges.*.ip")
      .notEmpty()
      .withMessage("IP address is required.")
      .isString()
      .withMessage("IP address must be a string."),
  ];
};

// validation rules for attendance
const validateCheckInAttendanceBody = () => {
  return [
    body("qr_code")
      .notEmpty()
      .withMessage("QR Code ID is required.")
      .isMongoId()
      .withMessage("QR Code ID must be a valid MongoID."),
    body("employee")
      .notEmpty()
      .withMessage("Employee ID is required.")
      .isMongoId()
      .withMessage("Employee ID must be a valid MongoID."),
    body("time_in")
      .notEmpty()
      .withMessage("Time In is required.")
      .isISO8601()
      .withMessage("Time In must be a valid date."),
    body("check_in_status")
      .notEmpty()
      .withMessage("Status is required.")
      .isString()
      .withMessage("Status must be a string."),
  ];
};

// validation rules for attendance
const validateCheckOutAttendanceBody = () => {
  return [
    body("qr_code")
      .notEmpty()
      .withMessage("QR Code ID is required.")
      .isMongoId()
      .withMessage("QR Code ID must be a valid MongoID."),
    body("check_out_status")
      .notEmpty()
      .withMessage("Status is required.")
      .isString()
      .withMessage("Status must be a string."),
    body("time_out")
      .optional()
      .isISO8601()
      .withMessage("Time Out must be a valid date."),
  ];
};

// validation rules for telegram message
const validateTelegramMessageBody = () => {
  return [body("message").notEmpty().withMessage("Message is required.")];
};

// validation rules for telegram image
const validateTelegramImageBody = () => {
  return [body("caption").optional().isString()];
};

// validation rules for leave request
const validateLeaveRequestBody = () => {
  return [
    body("type")
      .notEmpty()
      .withMessage("Leave type is required.")
      .isString()
      .withMessage("Leave type must be a string."),
    body("start_date")
      .notEmpty()
      .withMessage("Start date is required.")
      .isISO8601()
      .withMessage("Start date must be a valid date."),
    body("end_date")
      .notEmpty()
      .withMessage("End date is required.")
      .isISO8601()
      .withMessage("End date must be a valid date."),
    body("reason")
      .notEmpty()
      .withMessage("Reason is required.")
      .isString()
      .withMessage("Reason must be a string."),
  ];
};

const validateStatusLeaveRequestBody = () => {
  return [
    body("status")
      .notEmpty()
      .withMessage("Status is required.")
      .isString()
      .withMessage("Status must be a string."),
    body("comment")
      .optional()
      .isString()
      .withMessage("Comment must be a string."),
  ];
};

module.exports = {
  validationMiddleware,
  validateUserBody,
  validateQRCodeBody,
  validateCheckInAttendanceBody,
  validateCheckOutAttendanceBody,
  validateTelegramMessageBody,
  validateTelegramImageBody,
  validateLeaveRequestBody,
  validateStatusLeaveRequestBody,
};
