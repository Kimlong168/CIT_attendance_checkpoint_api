const mongoose = require("mongoose");

const networkRangeSchema = new mongoose.Schema({
  wifiName: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
});

const qrCodeSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },

  workStartTime: {
    type: String,
    required: true,
  },

  workEndTime: {
    type: String,
    required: true,
  },

  allowedNetworkRanges: {
    type: [networkRangeSchema], // Array of objects with specific schema
    required: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

const QRCode = mongoose.model("QRCode", qrCodeSchema);

module.exports = QRCode;
