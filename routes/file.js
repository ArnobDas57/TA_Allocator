const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const excelToJson = require("convert-excel-to-json");
const Course = require("../models/Course");
const Instructor = require("../models/Instructor");
const Applicant = require("../models/Applicant");
const { Parser } = require("json2csv");
const json2csvParser = new Parser();

// Init Storage Space
var x = 0;
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./storage");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage }).array("file");

// File Upload Route
router.post("/upload", function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
      // A Multer error occurred when uploading.
    } else if (err) {
      return res.status(500).json(err);
      // An unknown error occurred when uploading.
    }

    req.files.forEach((item) => {
      const result = excelToJson({
        sourceFile: `./storage/${item.filename}`,
      });
      const fileName = item.originalname.split(".xlsx")[0];

      try {
        fs.writeFileSync(
          `./storage/json/${fileName}.json`,
          JSON.stringify(result),
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );
        fs.unlink(`./storage/${item.filename}`, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          //file removed
        });
      } catch (err) {
        console.log(err);
      }
    });
    return res.status(200).send(req.file);
    // Everything went fine.
  });
});

// File Download Route
router.get("/download", async function (req, res) {
  const Type = req.query.type;
  const xd = {
    Course: {
      Model: Course,
      Fields: [
        "code",
        "name",
        "lecHours",
        "labTutHours",
        "sections",
        "questions",
      ],
    },
    Instructor: {
      Model: Instructor,
      Fields: ["name", "email", "courses"],
    },
    Applicant: {
      Model: Applicant,
      Fields: [
        "code",
        "appName",
        "appEmail",
        "appStatus",
        "hours",
        "courseRank",
        "qA",
      ],
    },
  };

  const { Model, Fields } = xd[Type];

  Model.find(async (err, result) => {
    const parser = new Parser({ fields: Fields });
    const csv = parser.parse(result);

    res.setHeader("Content-type", "application/octet-stream");
    res.setHeader("Content-disposition", "attachment; filename=file.csv");
    res.send(csv);
  });
});

module.exports = router;
