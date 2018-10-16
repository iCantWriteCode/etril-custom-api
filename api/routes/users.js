const express = require("express");
const mongoose = require('mongoose');

const router = express.Router();
const User = require("../models/users.model");
const Room = require("../models/room.model");

const jwtAuthentication = require("../authentication/auth.js");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const { verifyTokenMiddleware } = require("../authentication/auth.js");

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

// router.post("/registerdsadas", (req, res) => {
//   const { email, password } = req.body;
//   let newUser = new Users({ email, password });
//   newUser.verifyToken = randomstring.generate(35);
//   newUser.save((err, user) => {
//     if (err)
//       return res.status(500).json({
//         message: "Παρουσιάστηκε κάποιο σφάλμα",
//         error: { message: err }
//       });
//     return res.status(200).json({
//       message: "Επιτυχής εγγραφή",
//       token: user.token
//     });
//   });
// });

// router.get("/all", verifyTokenMiddleware, (req, res) => {
//   if (req.tokenDecoded.typeOfUser !== "admin") {
//     return res.status(403).json({
//       message: "Παρουσιάστηκε κάποιο σφάλμα",
//       error: { message: "Δεν έχετε δικαίωμα πρόσβασης" }
//     });
//   }
//   let perPage = parseInt(req.query.perPage);
//   let skip = parseInt(req.query.skip);
//   let orderby = req.query.orderby;
//   let sort = req.query.sort;
//   let filter = req.query.filter;
//   let query;
//   if (filter) {
//     query = { $text: { $search: filter, $diacriticSensitive: false } };
//   } else {
//     query = {};
//   }
//   User.find(query)
//     .skip(skip)
//     .sort({ [orderby]: sort })
//     .limit(perPage)
//     .exec(function(err, users) {
//       User.countDocuments().exec(function(err, count) {
//         if (err) {
//           return res.status(500).json({
//             error: { message: "Υπήρξε κάποιο πρόβλημα" }
//           });
//         }
//         if (!users) {
//           return res.status(404).json({
//             error: { message: "Δεν βρέθηκαν χρήστες" }
//           });
//         } else {
//           return res.status(200).json({
//             pages: Math.ceil(count),
//             count,
//             users
//           });
//         }
//       });
//     });
// });

// router.get("/:id", verifyTokenMiddleware, (req, res, next) => {
//   const { id } = req.tokenDecoded;
//   if (id !== req.params.id) {
//     return res.status(403).json({
//       message: "Παρουσιάστηκε κάποιο σφάλμα",
//       error: { message: "Δεν έχετε δικαίωμα πρόσβασης" }
//     });
//   }
//   User.findById(id, function(err, user) {
//     if (err) {
//       return res.status(500).json({
//         message: "Παρουσιάστηκε κάποιο σφάλμα",
//         error: { message: "Παρουσιάστηκε κάποιο σφάλμα" }
//       });
//     }
//     return res
//       .status(200)
//       .json({ wishlist: user.wishlist, notifications: user.notifications });
//   });
// });

// router.post("/login", (req, res) => {
//   const { email, password } = req.body;
//   User.findOne({ email: email }, (err, user) => {
//     if (err)
//       return res.status(500).json({
//         message: "Παρουσιάστηκε κάποιο σφάλμα",
//         error: { message: err }
//       });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "To email ή ο κωδικός σας είναι λανθασμένος" });
//     }
//     user.comparePassword(password, (err, isMatch) => {
//       if (!isMatch) {
//         return res
//           .status(404)
//           .json({ message: "To email ή ο κωδικός σας είναι λανθασμένος 2" });
//       }
//       const jwtUserData = {
//         email: user.email,
//         id: user._id,
//         typeOfUser: "user"
//       };
//       jwtAuthentication
//         .createSign(jwtUserData)
//         .then(token => {
//           const decoded = jwt.decode(token);
//           res.status(200).json({
//             email: user.email,
//             id: user._id,
//             token: token,
//             expirationDate: decoded.exp
//           });
//         })
//         .catch(err => {
//           res.status(400).json(err);
//         });
//     });
//   });
// });

// router.post("/register", (req, res) => {
//   const { email, password } = req.body;
//   let newUser = new Users({ email, password });
//   newUser.verifyToken = randomstring.generate(35);
//   newUser.save((err, user) => {
//     if (err)
//       return res.status(500).json({
//         message: "Παρουσιάστηκε κάποιο σφάλμα",
//         error: { message: err }
//       });
//     return res.status(200).json({
//       message: "Επιτυχής εγγραφή",
//       token: user.token
//     });
//   });
// });

// router.post("/notifications", verifyTokenMiddleware, (req, res) => {
//   const { id } = req.tokenDecoded;
//   const { notifications } = req.body;
//   User.findOneAndUpdate({ _id: id }, { new: true }, (err, user) => {
//     if (err) {
//       return res.status(500).json({
//         message: "Παρουσιάστηκε κάποιο σφάλμα",
//         error: { message: err }
//       });
//     }
//     if (!user) {
//       return res.status(404).json({
//         message: " Δεν βρέθηκε ο χρήστης"
//       });
//     }
//     if (user) {
//       user.notifications = notifications;
//       user.save((err, result) => {
//         if (err) {
//           return res.status(500).json({
//             message: "Παρουσιάστηκε κάποιο σφάλμα",
//             error: { message: err }
//           });
//         }
//         return res.status(200).json({
//           message: "Η αλλαγή ρυθμίσεων πραγματοποιήθηκε με επιτυχία"
//         });
//       });
//     }
//   });
// });

// router.patch("/:id/wishlistUpdate", verifyTokenMiddleware, (req, res, next) => {
//   const { id } = req.tokenDecoded;
//   const data = req.body;
//   if (id !== req.params.id) {
//     return res.status(403).json({
//       message: "Παρουσιάστηκε κάποιο σφάλμα",
//       error: { message: "Δεν έχετε δικαίωμα πρόσβασης" }
//     });
//   }
//   User.findById(id, function(err, user) {
//     if (err) return console.log(err);
//     let wishlist = user.wishlist;
//     const isInUserWishlist = wishlist.findIndex(
//       wishlistItem => wishlistItem.id === data.wishlist[0].id
//     );
//     if (isInUserWishlist !== -1) {
//       wishlist.splice(isInUserWishlist, 1);
//       user.save(function(err) {
//         if (err) return console.log(err);
//         res
//           .status(200)
//           .json({ status: "Ok", message: "Item removed in wishlist" });
//       });
//     } else {
//       wishlist.push(data.wishlist[0]);
//       user.save(function(err) {
//         if (err) return console.log(err);
//         res
//           .status(200)
//           .json({ status: "Ok", message: "Item added in wishlist" });
//       });
//     }
//   });
// });

// router.patch("/:id/changePassword", verifyTokenMiddleware, (req, res) => {
//   const { id } = req.tokenDecoded;
//   const { password, newPassword } = req.body;
//   if (id !== req.params.id) {
//     return res.status(403).json({
//       message: "Παρουσιάστηκε κάποιο σφάλμα",
//       error: { message: "Δεν έχετε δικαίωμα πρόσβασης" }
//     });
//   }
//   User.findOneAndUpdate({ _id: id }, { new: true }, (err, user) => {
//     if (err) {
//       return res.status(500).json({
//         message: "Παρουσιάστηκε κάποιο σφάλμα",
//         error: { message: err }
//       });
//     }
//     if (!user) {
//       return res.status(404).json({
//         message: " Δεν βρέθηκε ο χρήστης"
//       });
//     }
//     if (user) {
//       user.comparePassword(password, (err, isMatch) => {
//         if (!isMatch) {
//           return res
//             .status(404)
//             .json({ message: "Ο παλιός κωδικός είναι λανθασμένος" });
//         } else {
//           user.password = newPassword;
//           user.save((err, result) => {
//             if (err) {
//               return res.status(500).json({
//                 message: "Παρουσιάστηκε κάποιο σφάλμα",
//                 error: { message: err }
//               });
//             }
//             return res.status(200).json({
//               message: "Η αλλαγή κωδικού πραγματοποιήθηκε με επιτυχία"
//             });
//           });
//         }
//       });
//     }
//   });
// });

// router.post("/verify", (req, res) => {});

module.exports = router;
