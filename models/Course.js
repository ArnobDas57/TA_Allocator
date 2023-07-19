const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    uppercase: true,
  },
  lecHours: {
    type: Number,
    required: true,
  },
  labTutHours: {
    type: Number,
    default: 0,
    required: true,
  },
  sections: {
    type: Number,
    required: true,
  },
  taHours: {
    type: Number,
    default: -1,
  },
  prevEnrollments: {
    type: Number,
    default: 0,
  },
  currEnrollments: {
    type: Number,
    default: 0,
  },
  prevTAHours: {
    type: Number,
    default: 0,
  },
  used: {
    type: Number,
    default: 0,
  },
  questions: {
    type: [String],
  },
});

const Course = (module.exports = mongoose.model("Course", courseSchema));
