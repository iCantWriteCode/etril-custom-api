const express = require("express");
const mongoose = require('mongoose');

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

    // userModel.find({username : req.body.username}, function (err, userfound)
    User.findById(req.body.gm, function (err, user) {
        if (err) return res.status(500).json(err)
        // res.status(200).json(user)

        // var newArticle = new articleModel({
        //     title : req.body.title,
        //     text : req.body.text,
        //     creator : userfound._id
        // });
        const room = new Room({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            gm: req.body.gm
        });

        // newArticle.save(function (err, article){
        //         userfound.articles.push(article); //Error : Cannot read property 'push' of undefined
        //         userfound.save();
        //         res.send("Article enregistré : " + userfound.articles);
        // });
        console.log(user)
        room.save((err, room) => {
            if (err) return res.status(500).json({ message: 'gamw thn banagia', err: err })
            user.rooms.unshift(room); //Error : Cannot read property 'push' of undefined
            user.save();
            res.status(200).json({ message: 'OK', room: room, user: user })
        })
    });


})

router.post('/add-user', (req, res, next) => {

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

