const ClientVisitLog = require("../models/clientVisitLog.model");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const { sendTelegramMessage } = require("../utils/sendTelegramMessage");
const {
  getFormattedTimeWithAMPM,
  getFormattedDate,
} = require("../utils/getFormattedDate");

// Retrieve all ClientVisitLogs from the database.
const getAllClientVisitLogs = async (req, res, next) => {
  try {
    const clientVisitLogs = await ClientVisitLog.find()
      .populate({
        path: "employee",
        select: "name role",
      })
      .exec();

    return successResponse(
      res,
      clientVisitLogs,
      "Client visit logs retrieved successfully"
    );
  } catch (error) {
    return next(error);
  }
};

// Find a single ClientVisitLog with an id
const getClientVisitLogById = async (req, res, next) => {
  try {
    const clientVisitLog = await ClientVisitLog.findById(req.params.id)
      .populate({
        path: "employee",
        select: "name role",
      })
      .exec();

    if (!clientVisitLog) {
      return errorResponse(res, "Client visit logs not found", 404);
    }

    return successResponse(
      res,
      clientVisitLog,
      "Client visit logs retrieved successfully"
    );
  } catch (error) {
    return next(error);
  }
};

// Find a single ClientVisitLog with an employee id
const getClientVisitLogByEmployeeId = async (req, res, next) => {
  try {
    const clientVisitLogs = await ClientVisitLog.find({
      employee: req.params.id,
    })
      .populate({
        path: "employee",
        select: "name role",
      })
      .sort({ date: -1 })
      .exec();

    if (!clientVisitLogs) {
      return errorResponse(
        res,
        "Client visit logs retrieved successfully",
        404
      );
    }

    return successResponse(
      res,
      clientVisitLogs,
      "Client visit logs retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Create and Save a new ClientVisitLog
const createClientVisitLog = async (req, res, next) => {
  try {
    const clientVisitLog = new ClientVisitLog({
      employee: req.user.id,
      agentName: req.body.agentName,
      purpose: req.body.purpose,
      date: req.body.date,
      startTime: req.body.startTime,
      expectedEndTime: req.body.expectedEndTime,
      notes: req.body.notes,
    });

    await clientVisitLog.save();

    await sendTelegramMessage(
      `
    🆕 *New Client Visit Log*
    \n🆔 ID: \`${clientVisitLog._id}\`
    \n👤 Employee: ${req.user.name} (${req.user.role})
    \n🏫Agent Name: ${req.body.agentName}
    \n📄 Purpose: ${req.body.purpose}
    \n🗓️ Date: ${getFormattedDate(req.body.date)}
    \n🗓️ Start Time: ${getFormattedTimeWithAMPM(clientVisitLog.startTime)}
    \n🗓️ Expected End Time: ${getFormattedTimeWithAMPM(
      req.body.expectedEndTime
    )}
    \n📝 Notes: ${req.body.notes ? req.body.notes : "No note"}
  `,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_CLIENT_VISIT_LOG_ID
    );

    return successResponse(
      res,
      clientVisitLog,
      "Client visit log created successfully"
    );
  } catch (error) {
    return next(error);
  }
};

// Update a ClientVisitLog by the id in the request
const updateClientVisitLog = async (req, res, next) => {
  try {
    const clientVisitLog = await ClientVisitLog.findById(req.params.id);

    if (!clientVisitLog) {
      return errorResponse(res, "Client visit log not found", 404);
    }

    clientVisitLog.agentName = req.body.agentName;
    clientVisitLog.purpose = req.body.purpose;
    clientVisitLog.date = req.body.date;
    clientVisitLog.startTime = req.body.startTime;
    clientVisitLog.expectedEndTime = req.body.expectedEndTime;
    clientVisitLog.notes = req.body.notes;

    await clientVisitLog.save();

    await sendTelegramMessage(
      `
    🌟 *Client Visit Log Updated*
    \n🆔 ID: \`${clientVisitLog._id}\`
    \n👤 Employee: ${req.user.name} (${req.user.role})
    \n🏫Agent Name: ${req.body.agentName}
    \n📄 Purpose: ${req.body.purpose}
    \n🗓️ Date: ${getFormattedDate(req.body.date)}
    \n🗓️ Start Time: ${getFormattedTimeWithAMPM(clientVisitLog.startTime)}
    \n🗓️ Expected End Time: ${getFormattedTimeWithAMPM(
      req.body.expectedEndTime
    )}
    \n📝 Notes: ${req.body.notes ? req.body.notes : "No note"}
  `,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_CLIENT_VISIT_LOG_ID
    );

    return successResponse(
      res,
      clientVisitLog,
      "Client visit log updated successfully"
    );
  } catch (error) {
    return next(error);
  }
};

// Delete a ClientVisitLog with the specified id in the request
const deleteClientVisitLog = async (req, res, next) => {
  try {
    // can only delete pending requests
    const clientVisitLog = await ClientVisitLog.findById(req.params.id);

    if (!clientVisitLog) {
      return errorResponse(res, "Client visit log not found", 404);
    }

    await ClientVisitLog.findByIdAndDelete(req.params.id);

    await sendTelegramMessage(
      `
    *Client Visit Log Deleted* ❌
    \n🆔 ID: \`${clientVisitLog._id}\`
    \n👤 Employee: ${req.user.name}
    \n📅 Deleted Date: ${getFormattedDate(new Date())}
  `,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_CLIENT_VISIT_LOG_ID
    );

    return successResponse(
      res,
      clientVisitLog,
      "Client visit log deleted successfully"
    );
  } catch (error) {
    return next(error);
  }
};

// Delete all ClientVisitLogs from the database.
const clearAllClientVisitLogs = async (req, res, next) => {
  try {
    await ClientVisitLog.deleteMany();

    return successResponse(res, null, "Client visit logs cleared successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClientVisitLogs,
  getClientVisitLogById,
  getClientVisitLogByEmployeeId,
  createClientVisitLog,
  updateClientVisitLog,
  deleteClientVisitLog,
  clearAllClientVisitLogs,
};
