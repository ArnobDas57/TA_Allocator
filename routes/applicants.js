const express = require("express");
const router = express.Router();
const Applicant = require("../models/Applicant");
const config = require("config");
const multer = require("multer");
const fs = require("fs");
const excelToJson = require("convert-excel-to-json");
const User = require("../models/User");
const Instructor = require("../models/Instructor");
const { applicantValidation } = require("../models/validation");
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

// route to manually add/update new applicant data
router.post("/new", async function (req, res) {
  const { error } = applicantValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  Applicant.findOne(
    { code: req.body.code, appEmail: req.body.appEmail },
    (err, applicantCheck) => {
      if (err) throw err;
      if (!applicantCheck) {
        let applicant = new Applicant({
          code: req.body.code,
          appName: req.body.appName,
          appEmail: req.body.appEmail,
          appStatus: req.body.appStatus,
          hours: req.body.hours,
          courseRank: req.body.courseRank,
          qA: [],
        });

        for (let element in req.body.qA) {
          applicant.qA.push(req.body.qA[element]);
        }

        applicant.save();
      } else {
        let questionArray = [];

        for (let element in req.body.qA) {
          questionArray.push(req.body.qA[element]);
        }

        Applicant.replaceOne(
          { code: req.body.code, appEmail: req.body.appEmail },
          {
            code: req.body.code,
            appName: req.body.appName,
            appEmail: req.body.appEmail,
            appStatus: req.body.appStatus,
            hours: req.body.hours,
            courseRank: req.body.courseRank,
            qA: questionArray,
          },
          function (error, result) {
            if (error) {
              throw error;
            }
          }
        );
      }
    }
  );
  return res.status(200).send("Applicant Updated");
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
          Applicant.findOne(
            { code: e.A, appEmail: e.C },
            (err, applicantCheck) => {
              if (err) throw err;
              if (!applicantCheck) {
                let applicant = new Applicant({
                  code: e.A,
                  appName: e.B,
                  appEmail: e.C,
                  appStatus: e.D,
                  hours: e.E,
                  courseRank: e.F,
                  qA: [],
                });

                let count = 0;
                for (let prop in e) {
                  if (!e.hasOwnProperty(prop)) {
                    continue;
                  }
                  if (count > 5) {
                    applicant.qA.push(e[prop]);
                  }
                  count++;
                }
                applicant.save();
              }
            }
          );
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

//GET all applicants
router.get("/getAllApplicants", async function (req, res) {
  applicants = await Applicant.find();
  return res.status(200).send(applicants);
});

//Update instructorRank of the applicants

router.post("/updateInstructorRank", async function (req, res) {
  let applicants = req.body;

  applicants.forEach(async (applicant) => {
    Applicant.findOneAndUpdate(
      { _id: applicant._id },
      {
        $set: {
          instructorRank: applicant.instructorRank,
        },
      },
      { useFindAndModify: false },
      function (err, doc) {}
    );
  });
  return res.status(200).send("hello");
});

// Route to update accept/reject status
router.post("/updateMatchStatus", async function (req, res) {
  let applicants = req.body;

  applicants.forEach(async (applicant) => {
    Applicant.findOneAndUpdate(
      { code: applicant.code, appEmail: applicant.appEmail },
      {
        $set: {
          matchStatus: applicant.matchStatus,
        },
      },
      { useFindAndModify: false },
      function (err, doc) {}
    );
  });

  return res.status(200).send("match status updated");
});

module.exports = router;
