const express                 = require('express');
const router                  = express.Router();
const {verifyTokenMiddleware} = require('../authentication/auth.js');
const PushNotification        = require('../models/notifications.model');
const Areas                   = require('../models/areas.model');
const _                       = require('lodash');
const OneSignal               = require('onesignal-node');

let myClient = new OneSignal.Client({
    userAuthKey: 'ZGNjNzRkMWEtNjZhOS00OWE3LWFmZDYtNGYxOTkzMDI0ODBh',
    app        : {appAuthKey: 'YzU1ZjM1NjctYmYyMC00ZGY1LWE4NmItNzRmYzNjZDA1ODZj', appId: 'e97932e4-3139-429e-a3d9-81247c39c4bf'}
});

const sendPushNotification = (req, res, messageEn, messageEl, segments) => {
    let newSegment = [];
    segments.map(item => {
        newSegment.push(item.label);
    });
    let pushNotification = new OneSignal.Notification({
        contents         : {
            en: messageEn,
            el: messageEl
        },
        included_segments: newSegment
    });
    myClient.sendNotification(pushNotification)
            .then(function (response) {
                return res.status(200).json(response.data);
            })
            .catch(function (err) {
                console.log(err);
                return res.status(500).json(err);
            });
};

// GET ALL
router.get('/all', verifyTokenMiddleware, (req, res) => {
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    let perPage = parseInt(req.query.perPage);
    let skip    = parseInt(req.query.skip);
    let orderby = req.query.orderby;
    let sort    = req.query.sort;
    let filter  = req.query.filter;
    let query;
    if (filter) {
        query = {$text: {$search: filter, $diacriticSensitive: false}};
    } else {
        query = {};
    }
    PushNotification.find(query)
                    .skip(skip)
                    .sort({[orderby]: sort})
                    .limit(perPage)
                    .exec(function (err, notifications) {
                        PushNotification.countDocuments().exec(function (err, count) {
                            if (err) {
                                return res.status(500).json({
                                    error: {message: 'Υπήρξε κάποιο πρόβλημα'}
                                });
                            }
                            if (!notifications) {
                                return res.status(404).json({
                                    error: {message: 'Δεν βρέθηκαν notifications'}
                                });
                            } else {
                                return res.status(200).json({
                                    pages: Math.ceil(count),
                                    count,
                                    notifications
                                });
                            }
                        });
                    });
});

router.get('/areas', verifyTokenMiddleware, (req, res) => {
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    Areas.find({}, (err, areas) => {
        if (err) {
            return res.status(500).json({
                message: 'An error has occured',
                error  : {message: 'Παρουσιάστηκε κάποιο σφάλμα'}
            });
        }
        let areasFormatted = [];
        areas.map((areas) => {
            let area = {
                label: areas.name,
                value: areas.location
            };
            areasFormatted.push(area);
        });
        let orderedAreas = _.orderBy(areasFormatted, [area => area.label.toLowerCase()], ['asc']);
        return res.status(200).json({
            areas: orderedAreas
        });
    });
});

// POST ONE
router.post('/new', verifyTokenMiddleware, (req, res) => {
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    const {title, messageEn, messageEl, segments, send, save} = req.body;
    let newNotification                                       = new PushNotification({
        title    : title,
        messageEl: messageEl,
        messageEn: messageEn,
        segments : segments
    });

    newNotification.save((err, notification) => {
        if (err) {
            return res.status(500).json({
                message: 'An error has occured'
            });
        }
        if (send && save) {
            return sendPushNotification(req, res, messageEn, messageEl, segments);
        }
        else {
            return res.status(200).json({
                status : '200',
                message: 'Η ειδοποιήση αποθηκεύτηκε επιτυχώς',
                notification
            });
        }
    });
});

// DELETE ONE
router.delete('/delete/:id', verifyTokenMiddleware, (req, res) => {
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    const id = req.params.id;
    PushNotification.findByIdAndRemove(id, (err, notification) => {
        if (err) {
            return res.status(500).json({
                message: 'An error has occured'
            });
        }
        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found'
            });
        } else {
            return res.status(200).json({
                message: 'Notification deleted!'
            });
        }
    });
});

router.post('/resend/:id', verifyTokenMiddleware, (req, res) => {
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    let id = req.params.id;
    PushNotification.findOne({_id: id}, (err, notification) => {
        if (err) {
            return res.status(500).json({
                status: '500',
                error : {message: 'Υπήρξε κάποιο πρόβλημα'}
            });
        }
        const {messageEn, messageEl, segments} = notification;
        sendPushNotification(req, res, messageEn, messageEl, segments);
    });
});

router.post('/resend/edit/:id', verifyTokenMiddleware, (req, res) => {
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    let id     = req.params.id;
    const data = {
        title    : req.body.title,
        messageEl: req.body.messageEl,
        messageEn: req.body.messageEn,
        segments : req.body.segments
    };
    PushNotification.findOne({_id: id}, (err) => {
        if (err) {
            return res.status(500).json({
                status: '500',
                error : {message: 'Υπήρξε κάποιο πρόβλημα'}
            });
        }
        const {messageEn, messageEl, segments} = data;
        sendPushNotification(req, res, messageEn, messageEl, segments);
    });
});

router.patch('/edit/:id', verifyTokenMiddleware, (req, res) => {
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    const {id} = req.params.id;
    const data = {
        title    : req.body.title,
        messageEl: req.body.messageEl,
        messageEn: req.body.messageEn,
        segments : req.body.segments
    };
    PushNotification.findOneAndUpdate(id, {$set: data}, (err, notification) => {
        if (err) {
            return res.status(500).json({
                message: 'An error has occured'
            });
        }
        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found'
            });
        } else {
            return res.status(200).json(notification);
        }
    });
});

router.get('/:id', verifyTokenMiddleware, (req, res) => {
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    const id = req.params.id;
    PushNotification.findById(id, (err, notification) => {
        if (err) {
            return res.status(500).json({
                message: 'An error has occured'
            });
        }
        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found'
            });
        } else {
            return res.status(200).json({notification: notification});
        }
    });
});

module.exports = router;
