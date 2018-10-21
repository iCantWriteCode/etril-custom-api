const express = require("express");
const mongoose = require('mongoose');

const router = express.Router();
const User = require("../models/users.model");
const Room = require("../models/room.model");

const jwtAuthentication = require("../authentication/auth.js");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const { verifyTokenMiddleware } = require("../authentication/auth.js");


router.post('/register', (req, res, next) => {
  const { username, password, userType } = req.body
  User.find({ username: username })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        res.status(409).json({
          message: 'Username Already Exists'
        })
      } else {
        let newUser = new User({ _id: new mongoose.Types.ObjectId(), username, password, userType });
        // newUser.verifyToken = randomstring.generate(35);
        newUser.save((err, user) => {
          if (err)
            return res.status(500).json({
              message: "Παρουσιάστηκε κάποιο σφάλμα",
              error: { message: err }
            });
          return res.status(200).json({
            message: "Επιτυχής εγγραφή",
            token: user.token
          });
        });
      }
    })
})

router.post("/login", (req, res) => {
  console.log(req.body)
  const { username, password } = req.body;
  User.findOne({ username: username }, (err, user) => {
    if (err)
      return res.status(500).json({
        message: "Παρουσιάστηκε κάποιο σφάλμα",
        error: { message: err }
      });
    if (!user) {
      return res
        .status(404)
        .json({ message: "To email ή ο κωδικός σας είναι λανθασμένος" });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (!isMatch) {
        return res
          .status(404)
          .json({ message: "To email ή ο κωδικός σας είναι λανθασμένος 2" });
      }
      const jwtUserData = {
        username: user.username,
        id: user._id,
        userType: user.userType
      };
      jwtAuthentication
        .createSign(jwtUserData)
        .then(token => {
          const decoded = jwt.decode(token);
          res.status(200).json({
            username: user.username,
            id: user._id,
            token: token,
            userType: user.userType,
            expirationDate: decoded.exp
          });
        })
        .catch(err => {
          res.status(400).json(err);
        });
    });
  });
});

router.post('/:id/add-room', verifyTokenMiddleware, (req, res, next) => {
  const { id } = req.tokenDecoded;
  console.log(req.body)
  if (id !== req.params.id) {
    return res.status(403).json({
      message: "Παρουσιάστηκε κάποιο σφάλμα",
      error: { message: "Δεν έχετε δικαίωμα πρόσβασης" }
    });
  }
  User.update(
    { _id: req.params.id },
    { $push: { rooms: req.body.room } }
  )
    .exec()
    .then(result => {
      console.log(result)
      res.status(200).json({
        message: 'You joined the room!'
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json(err)
    })
})


router.get('/:id', (req, res, next) => {
  User.findById(req.params.id)
    .select('userType username')
    .populate({ path: 'rooms', select: 'name' })
    .exec()
    .then(user => {
      if (!user) res.status(500).json({ message: "Order Not Found" })
      res.status(200).json(user)
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
})

module.exports = router;
