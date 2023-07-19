const express = require("express");
const router = express.Router();
const config = require("config");
const Applicant = require("../models/Applicant");
const Course = require("../models/Course");

//Modify a single allocation
router.post("/update", async function (req, res) {
  let oldCodeCheck = false;
  let appCheck = false;
  let removeCheck = false;
  let statusCheck = false;
  let oldCourseHours = 0;

  await Course.find({ code: req.body.oldCode })
    .then((course) => {
      if (course.length == 1) {
        oldCodeCheck = true;
        oldCourseHours = course[0].used;
      }
    })
    .catch((err) => {
      return res.status(400).send("Error");
    });

  await Applicant.find({ appEmail: req.body.email, code: req.body.oldCode })
    .then((app) => {
      if (app.length == 1) {
        appCheck = true;
        if (app[0].matchStatus == 1 || app[0].matchStatus == 2) {
          statusCheck = true;
        }
      }
    })
    .catch((err) => {
      return res.status(400).send("Error");
    });

  await Applicant.find({ appEmail: req.body.email, code: req.body.newCode })
    .then((app) => {
      if (app.length == 1 && req.body.newCode != req.body.oldCode) {
        removeCheck = true;
      }
    })
    .catch((err) => {
      return res.status(400).send("Error");
    });

  await Course.find({ code: req.body.newCode })
    .then((course) => {
      if (course.length == 0) {
        return res.status(400).send("New course not found");
      } else if (course.length == 1) {
        let oldHoursParsed = parseInt(req.body.oldHours);
        let newHoursParsed = parseInt(req.body.newHours);
        if (removeCheck) {
          return res.status(400).send("Application already exists");
        } else if (
          !Number.isNaN(oldHoursParsed) &&
          !Number.isNaN(newHoursParsed) &&
          oldCodeCheck &&
          appCheck &&
          !removeCheck &&
          statusCheck
        ) {
          if (newHoursParsed < 0) {
            return res.status(400).send("Cannot have negative hours");
          } else {
            let newUsed;
            let sameCode = false;
            if (req.body.oldCode == req.body.newCode) {
              newUsed = course[0].used + newHoursParsed - oldHoursParsed;
              sameCode = true;
            } else {
              newUsed = course[0].used + newHoursParsed;
            }
            if (newUsed <= course[0].taHours) {
              if (sameCode) {
                Course.findOneAndUpdate(
                  { code: req.body.oldCode },
                  { $set: { used: newUsed } },
                  { useFindAndModify: false },
                  function (err, doc) {}
                );
              } else {
                Course.findOneAndUpdate(
                  { code: req.body.oldCode },
                  { $set: { used: oldCourseHours - oldHoursParsed } },
                  { useFindAndModify: false },
                  function (err, doc) {}
                );
                Course.findOneAndUpdate(
                  { code: course[0].code },
                  { $set: { used: newUsed } },
                  { useFindAndModify: false },
                  function (err, doc) {}
                );
              }
              Applicant.findOneAndUpdate(
                { code: req.body.oldCode, appEmail: req.body.email },
                { $set: { hours: newHoursParsed, code: req.body.newCode } },
                { useFindAndModify: false },
                function (err, doc) {}
              );
              return res.status(200).send("Allocation Updated");
            } else {
              return res.status(400).send("Entered hours exceed course limit");
            }
          }
        } else if (
          !Number.isNaN(oldHoursParsed) &&
          !Number.isNaN(newHoursParsed) &&
          oldCodeCheck &&
          appCheck &&
          !removeCheck &&
          !statusCheck
        ) {
          if (newHoursParsed < 0) {
            return res.status(400).send("Cannot have negative hours");
          } else {
            Applicant.findOneAndUpdate(
              { code: req.body.oldCode, appEmail: req.body.email },
              { $set: { hours: newHoursParsed, code: req.body.newCode } },
              { useFindAndModify: false },
              function (err, doc) {}
            );
            return res.status(200).send("Allocation Updated");
          }
        } else {
          return res.status(400).send("Error");
        }
      } else {
        return res.status(400).send("Multiple matching course codes found");
      }
    })
    .catch((err) => {
      return res.status(400).send("Error");
    });
});

//Delete an allocation
router.post("/remove", async function (req, res) {
  let courseCheck = false;
  let courseHours = 0;

  await Course.find({ code: req.body.code })
    .then((course) => {
      if (course.length == 1) {
        courseCheck = true;
        courseHours = course[0].used;
      }
    })
    .catch((err) => {
      return res.status(400).send("Error");
    });

  await Applicant.find({ appEmail: req.body.email, code: req.body.code })
    .then((app) => {
      if (app.length == 1 && courseCheck && app[0].matchStatus == 1) {
        Course.findOneAndUpdate(
          { code: req.body.code },
          { $set: { used: courseHours - app[0].hours } },
          { useFindAndModify: false },
          function (err, doc) {}
        );
        Applicant.findOneAndUpdate(
          { code: req.body.code, appEmail: req.body.email },
          { $set: { matchStatus: 0 } },
          { useFindAndModify: false },
          function (err, doc) {}
        );
        return res.status(200).send("Allocation Removed");
      } else {
        return res.status(400).send("Error");
      }
    })
    .catch((err) => {
      return res.status(400).send("Error");
    });
});

//Re-allocate
router.post("/add", async function (req, res) {
  let courseCheck = false;
  let courseHoursUsed = 0;
  let maxCourseHours = 0;

  await Course.find({ code: req.body.code })
    .then((course) => {
      if (course.length == 1) {
        courseCheck = true;
        courseHoursUsed = course[0].used;
        maxCourseHours = course[0].taHours;
      }
    })
    .catch((err) => {
      return res.status(400).send("Error");
    });

  await Applicant.find({ appEmail: req.body.email, code: req.body.code })
    .then((app) => {
      if (app[0].hours + courseHoursUsed > maxCourseHours) {
        return res.status(400).send("Allocation hours exceed course limit");
      } else {
        if (app.length == 1 && courseCheck && app[0].matchStatus == 0) {
          Course.findOneAndUpdate(
            { code: req.body.code },
            { $set: { used: courseHoursUsed + app[0].hours } },
            { useFindAndModify: false },
            function (err, doc) {}
          );
          Applicant.findOneAndUpdate(
            { code: req.body.code, appEmail: req.body.email },
            { $set: { matchStatus: 1 } },
            { useFindAndModify: false },
            function (err, doc) {}
          );
          return res.status(200).send("Re-allocated");
        } else {
          return res.status(400).send("Error");
        }
      }
    })
    .catch((err) => {
      return res.status(400).send("Error");
    });
});

//Execute matching algorithm
router.get("/matchTAs/:mult", async function (req, res) {
  let multiplierFocus = req.params.mult;
  let applicantMultiplier = 1;
  let instructorMultiplier = 1;

  //Add multiplier depending on which preference the chair wants to prioritize
  if (multiplierFocus.toUpperCase() == "APPLICANT") {
    applicantMultiplier = 5;
  } else if (multiplierFocus.toUpperCase() == "INSTRUCTOR") {
    instructorMultiplier = 5;
  }

  //Get data from database
  let data = await Applicant.find();
  let courseData = await Course.find();

  //Filter out courses which don't have allocated hours
  let filteredCourses = await courseData.filter((course) => {
    return course.taHours != -1;
  });

  //Initialze new used parameter for each course and list to contain TAs
  let allocation = filteredCourses.map((row) => {
    return {
      code: row.code,
      name: row.name,
      lecHours: row.lecHours,
      labTutHours: row.labTutHours,
      sections: row.sections,
      taHours: row.taHours,
      used: 0,
      list: [],
    };
  });

  //Sort by app status, if app status are equal, sort by average
  let orderedByAppStatus = data
    .map((row) => {
      return {
        code: row.code,
        appName: row.appName,
        appEmail: row.appEmail,
        appStatus: row.appStatus,
        hours: row.hours,
        courseRank: row.courseRank,
        instructorRank: row.instructorRank,
        matchStatus: row.matchStatus,
        avg:
          row.courseRank * applicantMultiplier +
          row.instructorRank * instructorMultiplier,
        allocation() {
          return allocation.find((all) => all.code === this.code);
        },
      };
    })
    .sort((a, b) =>
      a.appStatus === b.appStatus
        ? a.avg > b.avg
          ? 1
          : -1
        : a.appStatus > b.appStatus
        ? 1
        : -1
    );

  //Allocate hours for already accepted applicants (Only necessary for multiple runs of the match algo)
  orderedByAppStatus.forEach((participant) => {
    if (participant.matchStatus == 2) {
      participant.allocation().used += participant.hours;
      participant.allocation().list.push(participant);
    }
  });

  //Filter out applicants who have already been accepted or rejected
  orderedByAppStatus = orderedByAppStatus.filter((participant) => {
    return participant.matchStatus < 2;
  });

  //Take new data and go through it, adding each applicant's hours to the hour pool for the course
  const final = orderedByAppStatus
    .filter((participant) => {
      //If the participant does not have any matching courses, ignore them and move to next
      if (participant.allocation() == [] || !participant.allocation()) {
        return false;
      }

      //Add the applicant's hours to the course's used hours in temp variable for comparison without saving to db
      const afterJoining = participant.allocation().used + participant.hours;

      //Check if the used hours exceed the allocated limit for the course, if yes, move to the next applicant
      if (participant.allocation().taHours < afterJoining) {
        participant.allocation().list.push(participant);
        Applicant.findOneAndUpdate(
          { appEmail: participant.appEmail, code: participant.code },
          { $set: { matchStatus: 0 } },
          { useFindAndModify: false },
          function (err, doc) {}
        );
        return false;
      }
      //If the number of already allocated hours are already matching the number of hours for the course, move to next applicant
      if (participant.allocation().used === participant.allocation().taHours) {
        participant.allocation().list.push(participant);
        Applicant.findOneAndUpdate(
          { appEmail: participant.appEmail, code: participant.code },
          { $set: { matchStatus: 0 } },
          { useFindAndModify: false },
          function (err, doc) {}
        );
        return false;
      }
      //If there is space for the new TA's hours, add them to the course TA pool and update course used hours
      if (participant.allocation().used < participant.allocation().taHours) {
        participant.allocation().used += participant.hours;
        participant.allocation().list.push(participant);
        //Update match status to 1 if it was previously 0
        Applicant.findOneAndUpdate(
          { appEmail: participant.appEmail, code: participant.code },
          { $set: { matchStatus: 1 } },
          { useFindAndModify: false },
          function (err, doc) {}
        );
        return true;
      }
    })
    .map((person) => {
      //Remove added attributes for each entry
      delete person.allocation;
      delete person.avg;
      return person;
    });

  const list = {};
  list["empty"] = [];
  //Return the final list of TAs for the courses and mention which courses could not be filled
  allocation.forEach((allo) => {
    if (allo.taHours > allo.used) {
      list["empty"].push(allo.code);
    }
    list[allo.code] = allo.list;
    Course.findOneAndUpdate(
      { code: allo.code },
      { $set: { used: allo.used } },
      { useFindAndModify: false },
      function (err, doc) {}
    );
  });
  return res.status(200).send(list);
});

//Get applicant info in matching algo format without changing DB
router.get("/matchGet", async function (req, res) {
  let data = await Applicant.find();
  let courseData = await Course.find();
  let list = {};

  let allocation = courseData.map((row) => {
    return {
      code: row.code,
      list: [],
    };
  });

  let participants = data.map((row) => {
    return {
      code: row.code,
      appName: row.appName,
      appEmail: row.appEmail,
      appStatus: row.appStatus,
      hours: row.hours,
      courseRank: row.courseRank,
      instructorRank: row.instructorRank,
      matchStatus: row.matchStatus,
      allocation() {
        return allocation.find((all) => all.code === this.code);
      },
    };
  });

  participants
    .filter((participant) => {
      if (participant.allocation() == [] || !participant.allocation()) {
        return false;
      } else {
        participant.allocation().list.push(participant);
        return true;
      }
    })
    .map((person) => {
      delete person.allocation;
    });

  allocation.forEach((allo) => {
    list[allo.code] = allo.list;
  });

  return res.status(200).send(list);
});

module.exports = router;
