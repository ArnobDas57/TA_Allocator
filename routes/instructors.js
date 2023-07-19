const express = require("express");
const router = express.Router();
const Instructor = require("../models/Instructor");
const Course = require("../models/Course");
const Applicant = require("../models/Applicant");
const config = require("config");
const multer = require("multer");
const fs = require("fs");
const excelToJson = require("convert-excel-to-json");
const { instructorValidation } = require("../models/validation");

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

// Route to get all instructor data
router.get("", function (req, res) {
  Instructor.find({}, function (err, result) {
    if (err) return res.status(404);
    return res.status(200).send(result);
  });
});

// Add courses for a professor
router.post("/courses", async function (req, res) {
  const result = await Instructor.findOneAndUpdate(
    { name: req.body.name },
    { courses: req.body.courses },
    { new: true }
  );

  return res.status(200).send(result);
});

// route to manually add/update new instructor data
router.post("/new", async function (req, res) {
  const { error } = instructorValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  Instructor.findOne({ email: req.body.email }, (err, instructorCheck) => {
    if (err) throw err;
    if (!instructorCheck) {
      const instructor = new Instructor({
        name: req.body.name,
        email: req.body.email,
        courses: [],
      });

      for (let element in req.body.courses) {
        instructor.courses.push(req.body.courses[element]);
      }

      instructor.save();
    } else {
      let coursesArray = [];

      for (let element in req.body.courses) {
        coursesArray.push(req.body.courses[element]);
      }

      Instructor.replaceOne(
        { email: req.body.email },
        {
          name: req.body.name,
          email: req.body.email,
          courses: coursesArray,
        },
        function (error, result) {
          if (error) {
            return res.status(400).send("Update Failed");
          }
        }
      );
    }
  });
  return res.status(200).send("Instructor Updated");
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
          Instructor.findOne({ email: e.B }, (err, instructorCheck) => {
            if (err) throw err;
            if (!instructorCheck) {
              const instructor = new Instructor({
                name: e.A,
                email: e.B,
                courses: [],
              });

              let count = 0;
              for (let prop in e) {
                if (!e.hasOwnProperty(prop)) {
                  continue;
                }
                if (count > 1) {
                  instructor.courses.push(e[prop]);
                }
                count++;
              }

              instructor.save();
            } else {
              let count = 0;
              coursesArray = [];
              for (let prop in e) {
                if (!e.hasOwnProperty(prop)) {
                  continue;
                }
                if (count > 1) {
                  coursesArray.push(e[prop]);
                }
                count++;
              }
              Instructor.replaceOne(
                { email: e.B },
                {
                  name: e.A,
                  email: e.B,
                  courses: coursesArray,
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
        });
      } catch (err) {
        console.log(err);
      }
    });
    return res.status(200).send(req.file);
  });
});
router.get("/getEmail/:email", async (req, res) => {
  instructor = await Instructor.find({ email: req.params.email });

  return res.status(200).send(instructor);
});
router.get("/questions/:code", async (req, res) => {
  courses = await Course.find({ code: req.params.code });
  return res.status(200).send(courses);
});

router.post("/questions/:code", async (req, res) => {
  let questions = req.body;

  Course.findOneAndUpdate(
    { code: req.params.code },
    {
      $set: {
        questions: questions,
      },
    },
    { useFindAndModify: false },
    function (err, doc) {}
  );

  return res.status(200).send("hello");
});

module.exports = router;
