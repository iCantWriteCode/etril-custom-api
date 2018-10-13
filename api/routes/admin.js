const express                 = require('express');
const router                  = express.Router();
const Admin                   = require('../models/admin.model');
const User                    = require('../models/users.model');
const jwtAuthentication       = require('../authentication/auth.js');
const jwt                     = require('jsonwebtoken');
const {verifyTokenMiddleware} = require('../authentication/auth.js');

router.post('/login', (req, res) => {
    const {email, password} = req.body;
    Admin.findOne({email: email}, (err, user) => {
        if (err)
            return res.status(500).json({
                message: 'An error occurred.'
            });
        if (!user) {
            return res
                .status(404)
                .json({
                    message: 'To email ή ο κωδικός σας είναι λανθασμένος',
                    error  : {message: 'To email ή ο κωδικός σας είναι λανθασμένος'}
                });
        }
        user.comparePassword(password, (err, isMatch) => {
            if (!isMatch) {
                return res
                    .status(404)
                    .json({
                        message: 'To email ή ο κωδικός σας είναι λανθασμένος',
                        error  : {message: 'To email ή ο κωδικός σας είναι λανθασμένος'}
                    });
            }
            const jwtUserData = {
                email     : user.email,
                id        : user._id,
                typeOfUser: 'admin'
            };
            jwtAuthentication
                .createSign(jwtUserData)
                .then(token => {
                    const decoded = jwt.decode(token);
                    res.status(200).json({
                        email         : user.email,
                        id            : user._id,
                        token         : token,
                        expirationDate: decoded.exp,
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).json(err);
                });
        });
    });
});

// router.post("/register", (req, res) => {
//   const { email, password } = req.body;
//   let newUser = new Admin({
//     email: email,
//     password: password
//   });
//   newUser.save((err, user) => {
//     if (err) {
//       return res.status(500).json({
//         message: "An error has occured"
//       });
//     } else {
//       return res.status(200).json({ message: "Επιτυχής Εγγραφή" });
//     }
//   });
// });

router.get('/users', verifyTokenMiddleware, (req, res) => {
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    User.find({}, {'password': 0}).populate('user').exec((err, users) => {
        if (err) {
            return res.status(500).json({
                message: 'Παρουσιάστηκε κάποιο σφάλμα',
                error  : {message: err}
            });
        }
        if (!users) {
            return res.status(404).json({
                message: ' Δεν βρέθηκαν χρήστες'
            });
        }
        if (users) {
            return res.status(200).json({
                users
            });
        }
    });
});

router.get('/user/:id', verifyTokenMiddleware, (req, res) => {
    const id = req.params.id;
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    User.findById({_id: id}, {'password': 0}).populate('user').exec((err, user) => {
        if (err) {
            return res.status(500).json({
                message: 'Παρουσιάστηκε κάποιο σφάλμα',
                error  : {message: err}
            });
        }
        if (!user) {
            return res.status(404).json({
                message: ' Δεν βρέθηκε ο χρήστης'
            });
        }
        if (user) {
            return res.status(200).json({
                user
            });
        }
    });
});

router.delete('/user/:id', verifyTokenMiddleware, (req, res) => {
    const id = req.params.id;
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    User.findOneAndRemove(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                message: 'Παρουσιάστηκε κάποιο σφάλμα',
                error  : {message: err}
            });
        }
        if (!user) {
            return res.status(404).json({
                message: ' Δεν βρέθηκε ο χρήστης'
            });
        }
        return res.status(200).json({
            message: 'Ο χρήστης διαγράφηκε με επιτυχία'
        });
    });
});

module.exports = router;
