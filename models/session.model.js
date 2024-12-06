const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expiresAt: Date,
});

const Session = mongoose.model("Sessions", sessionSchema);

module.exports = Session;
