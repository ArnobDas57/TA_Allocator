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
    cb(null, "./");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage }).array("file");

router.get("", function (req, res) {
  Course.find({}, function (err, result) {
    if (err) return res.status(404);
    return res.status(200).send(result);
  });
});

// route to manually add/update new course data
router.post("/newcourse", async function (req, res) {
  Course.findOne({ code: req.body.code }, (err, courseCheck) => {
    if (err) throw err;
    if (!courseCheck) {
      const course = new Course({
        code: req.body.code,
        name: req.body.name,
        lecHours: req.body.lecHours,
        labTutHours: req.body.labTutHours,
        sections: req.body.sections,
      });
      course.save();
    } else {
      Course.replaceOne(
        { code: req.body.code },
        {
          code: req.body.code,
          name: req.body.name,
          lecHours: req.body.lecHours,
          labTutHours: req.body.labTutHours,
          sections: req.body.sections,
        },
        function (error, result) {
          if (error) {
            throw error;
          }
        }
      );
    }
  });
  return res.status(200).send("Courses Updated");
});

router.post("", async function (req, res) {
  const result = await Course.findOneAndUpdate(
    { code: req.body.code },
    { taHours: req.body.taHours },
    { new: true }
  );

  return res.status(200).send(result);
});

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
        sourceFile: `./${item.filename}`,
      });
      const fileName = item.originalname.split(".xlsx")[0];

      try {
        fs.writeFileSync(
          `./${fileName}.json`,
          JSON.stringify(result),
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );
        fs.unlink(`./${item.filename}`, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          //file removed
        });

        //Get the JSON data
        const rawData = JSON.parse(
          fs.readFileSync(`./${fileName}.json`, "utf8")
        );
        const sheet1 = rawData[Object.keys(rawData)[0]].slice(1);

        //For each entry, check if the course already exists. If yes, update it. If no, save a new course
        sheet1.forEach((e) => {
          Course.findOne({ code: e.A }, (err, courseCheck) => {
            if (err) throw err;
            if (!courseCheck) {
              const course = new Course({
                code: e.A,
                name: e.B,
                lecHours: e.C,
                labTutHours: e.D,
                sections: e.E,
              });
              course.save();
            } else {
              Course.replaceOne(
                { code: e.A },
                {
                  code: e.A,
                  name: e.B,
                  lecHours: e.C,
                  labTutHours: e.D,
                  sections: e.E,
                },
                function (error, result) {
                  if (error) {
                    throw error;
                  }
                }
              );
            }
          });
        });

        fs.unlink(`./${fileName}.json`, (err) => {
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

module.exports = router;
