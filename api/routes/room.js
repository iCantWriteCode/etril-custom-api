const express = require("express");
const router = express.Router();
const Room = require("../models/room.model");
const User = require("../models/users.model");
const jwtAuthentication = require("../authentication/auth.js");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const { verifyTokenMiddleware } = require("../authentication/auth.js");

router.get('/:id', (req, res, next) => {
    Room.findById(req.params.id)
        .then(room => { res.status(200).json(room) })
        .catch(err => res.status(404).json({ message: 'room not found' }))
})

router.post('/new-room', verifyTokenMiddleware, (req, res, next) => {
    const { name, gm } = req.body
    const { id, userType } = req.tokenDecoded;

    // Checks If user is gm
    if (userType !== 'GM') return res.status(403).json({
        message: "Παρουσιάστηκε κάποιο σφάλμα",
        error: { message: "Δεν είστε admin" }
    });

    // Checks If Token is the same as the id of gm creating the rmm
    if (id !== gm) {
        return res.status(403).json({
            message: "Παρουσιάστηκε κάποιο σφάλμα",
            error: { message: "Δεν έχετε δικαίωμα πρόσβασης" }
        });
    }

    User
        .findById(gm)
        .then(gm => {

            // Checks If Gm Exists
            if (!gm) {
                return res.status(404).json({
                    message: 'Gm not found'
                })
            } else {
                let newRoom = new Room({ name, gm });

                newRoom.save((err, room) => {
                    if (err)
                        return res.status(500).json({
                            message: "Το ονομα του Room υπάρχει ήδη",
                            // error: { message: err }
                        });
                    return res.status(200).json({
                        message: "Επιτυχής εγγραφή",
                        data: {
                            roomdId: room._id,
                            roomName: room.name,
                            roomGM: room.gm._id,
                            users: room.users,
                        }
                    });
                })

            }
        })
})

router.patch('/add-user', (req, res, next) => {

    Room.findById(req.body.roomID, (err, room) => {

        if (err) return res.status(404).json({ message: "Room not found" });
        let currentUsers = room.users
        const isInRoom = currentUsers.findIndex(
            user => user.id === req.body.user
        );
        if (isInRoom <= -1) {
            currentUsers.push({ id: req.body.user, race: req.body.race, mainClass: req.body.mainClass, subclass: req.body.subclass });
            console.log(currentUsers)
            room.save((err) => {
                if (err) return console.log(err);
                res.status(200).json({ message: "You have joined the room" });
            });
        } else res.status(500).json({ message: "You are already in this room" });
    });
})

module.exports = router;

