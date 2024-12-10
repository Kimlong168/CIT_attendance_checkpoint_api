const mongoose = require("mongoose");

const clientVisitLogSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  purpose: {
    type: String,
    required: true,
  },

  agentName: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },

  startTime: {
    type: Date,
    required: true,
  },

  expectedEndTime: {
    type: Date,
    required: true,
  },

  notes: {
    type: String,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

  updated_at: {
    type: Date,
    default: Date.now,
  },
});
const ClientVisitLog = mongoose.model("clientVisitLog", clientVisitLogSchema);
module.exports = ClientVisitLog;
