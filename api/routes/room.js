const express = require("express");
const mongoose = require('mongoose');

const router = express.Router();
const Room = require("../models/room.model");
const User = require("../models/users.model");
const jwtAuthentication = require("../authentication/auth.js");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const { verifyTokenMiddleware } = require("../authentication/auth.js");



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
    console.log(req.body)

    Room.findById(req.body.roomId, (err, room) => {

        if (err) return res.status(404).json({ message: "Room not found" });

        console.log(room)

        let currentUsers = room.users
        const isInRoom = currentUsers.findIndex(
            user => user.id === req.body.userId
        );
        console.log('isInRoom', isInRoom)
        if (isInRoom <= -1) {
            currentUsers.push({
                id: req.body.userId,
                username: req.body.username,
                playerRace: req.body.playerRace,
                playerClass: req.body.playerClass,
                playerSubclass: req.body.playerSubclass,
                stats: req.body.stats,
                gear: req.body.gear,
                bag: req.body.bag,
                generalInfo: req.body.generalInfo
            });
            room.save((err, room) => {
                if (err) return console.log(err);
                console.log(room._id)
                User.findById(req.body.userId, (err, user) => {
                    if (err) return console.log(err)
                    user.rooms.push(room._id)
                    user.save(err, user => {
                        if (err) console.log(err)
                        res.status(200).json(user)
                    });
                })
            });
        } else res.status(500).json({ message: "You are already in this room" });
    });
})

router.patch('/edit-user/:roomId', (req, res, next) => {
    // WOrking

    // Room.update({ 'users.id': req.body.userId },
    //     {
    //         '$set': {

    //             'users.$.username': "this is Update comment",
    //         }
    //     }, (err, room) => {
    //         if (err) {
    //             console.log(err);
    //             return res.send(err);
    //         }
    //         return res.json(room);
    //     }); 
    Room.findById(req.params.roomId, (err, room) => {
        if (err) return res.send({ message: "room not found", err: err })
        let userIndex = room.users.findIndex(user => user.id === req.body.id)
        room.users.splice(userIndex, 1)
        room.users.push(req.body)
        room.save((err, test) => {
            if (err) return res.status(500).json(err)
            console.log(test)
            res.status(200).json(test)
        })
    });
})



router.get('/:id', (req, res, next) => {
    Room.findById(req.params.id)
        .then(room => { res.status(200).json(room) })
        .catch(err => res.status(404).json({ message: 'room not found' }))

})

module.exports = router;

