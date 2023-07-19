const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const config = require("config");
const multer = require("multer");
const fs = require("fs");
const excelToJson = require("convert-excel-to-json");

// Init Storage Space
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage }).array("file");

// File Upload Route
router.post("/upload", async function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
      // A Multer error occurred when uploading.
    } else if (err) {
      return res.status(500).json(err);
      // An unknown error occurred when uploading.
    }

    let data;
    req.files.forEach((item) => {
      const result = excelToJson({
        sourceFile: `./${item.filename}`,
      });
      const sheet1 = result[Object.keys(result)[0]].slice(1);

      sheet1.forEach(async (item) => {
        data = await Course.findOneAndUpdate(
          { code: item.A },
          {
            prevEnrollments: item.C,
            prevTAHours: item.D,
            currEnrollments: item.E,
          },
          { new: true }
        );
      });

      fs.unlink(`./${item.filename}`, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        //file removed
      });
    });

    return res.status(200).send(data);
  });
});

module.exports = router;
