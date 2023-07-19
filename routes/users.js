const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const config = require("config");
const jwt = require("jsonwebtoken");

//Register user, only here for testing
router.post("/", (req, res) => {
  if (
    !req.body.name ||
    !req.body.email ||
    !req.body.password ||
    !req.body.role
  ) {
    return res.status(400).json({ msg: "Missing fields" });
  }

  if (
    req.body.role != "DEPARTMENT" &&
    req.body.role != "INSTRUCTOR" &&
    req.body.role != "CHAIR"
  ) {
    return res.status(400).json({ msg: "Invalid role" });
  }

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  });

  User.findOne({ email: user.email }, (err, userCheck) => {
    if (err) throw err;
    if (!userCheck) {
      //Hash password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) throw err;
          user.password = hash;
          user.save().then((user) => {
            jwt.sign(
              { id: user.id, role: user.role },
              config.get("jwtSecret"),
              { expiresIn: 3600 },
              (err, token) => {
                if (err) throw err;
                res.json({
                  token,
                  user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                  },
                });
              }
            );
          });
        });
      });
    } else {
      return res.status(400).json({ msg: "User already exists " });
    }
  });
});

module.exports = router;
