const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    index: true,
    trim: true,
  },
  appName: {
    type: String,
    required: true,
    trim: true,
  },
  appEmail: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  appStatus: {
    type: Number,
    default: 0,
  },
  hours: {
    type: Number,
    min: 5,
    max: 10,
    default: 5,
  },
  courseRank: {
    type: Number,
    default: 1,
  },
  instructorRank: {
    type: Number,
    default: -1,
  },
  matchStatus: {
    type: Number,
    default: 0,
  },
  qA: {
    type: [String],
  },
});

applicantSchema.index({ code: 1, appEmail: 1 });

const Course = (module.exports = mongoose.model("Applicant", applicantSchema));
