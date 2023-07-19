const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const config = require("config");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

//Authenticate user
router.post("/", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ msg: "Missing fields" });
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  User.findOne({ email: user.email }, (err, userCheck) => {
    if (err) throw err;
    if (userCheck) {
      //Check password
      bcrypt.compare(user.password, userCheck.password).then((isMatch) => {
        if (!isMatch) {
          return res.status(400).json({ msg: "Invalid password" });
        } else {
          jwt.sign(
            { id: userCheck.id, role: userCheck.role },
            config.get("jwtSecret"),
            { expiresIn: 3600 },
            (err, token) => {
              if (err) throw err;
              res.json({
                token,
                user: {
                  id: userCheck.id,
                  name: userCheck.name,
                  email: userCheck.email,
                  role: userCheck.role,
                },
              });
            }
          );
        }
      });
    } else {
      return res.status(400).json({ msg: "User does not exist " });
    }
  });
});

//Validates user
//Use this as a sample on how to restrict routes
router.get("/user", auth, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then((user) => res.json(user));
  //user variable holds information about the logged in user
  //Contains the id, name, email, and role
  //Can be used to validate role specific routes etc.
});

module.exports = router;
