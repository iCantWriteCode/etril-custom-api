const express                 = require('express');
const router                  = express.Router();
const {verifyTokenMiddleware} = require('../authentication/auth.js');

const Offer = require('../models/offers.model');

router.get('/all', (req, res) => {
    let perPage  = parseInt(req.query.perPage);
    let skip     = parseInt(req.query.skip);
    let orderby  = req.query.orderby;
    let sort     = req.query.sort;
    let filter   = req.query.filter;
    let language = req.query.language;
    let query;
    if (filter) {
        query = {$text: {$search: filter, $diacriticSensitive: false}};
    } else {
        query = {};
    }
    if (language) {
        query = {language: language};
    }
    Offer.find(query)
         .skip(skip)
         .sort({[orderby]: sort})
         .limit(perPage)
         .exec(function (err, offers) {
             Offer.countDocuments().exec(function (err, count) {
                 if (err) {
                     return res.status(500).json({
                         error: {message: 'Υπήρξε κάποιο πρόβλημα'}
                     });
                 }
                 if (!offers) {
                     return res.status(404).json({
                         error: {message: 'Δεν βρέθηκαν offers'}
                     });
                 } else {
                     return res.status(200).json({
                         pages: Math.ceil(count),
                         count,
                         offers
                     });
                 }
             });
         });
});

router.post('/new', verifyTokenMiddleware, (req, res) => {
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    const {title, description, language, status} = req.body;
    let newOffer                                 = new Offer({
        title      : title,
        description: description,
        language   : language,
        status     : status
    });
    newOffer.save((err, offer) => {
        if (err) {
            return res.status(500).json({
                message: 'An error has occured'
            });
        }
        return res.status(200).json(offer);
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
    Offer.findById(id, (err, offer) => {
        if (err) {
            return res.status(500).json({
                message: 'An error has occured'
            });
        }
        if (!offer) {
            return res.status(404).json({
                message: 'Notification not found'
            });
        } else {
            return res.status(200).json({offer: offer});
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
    Offer.findByIdAndRemove(id, (err, offer) => {
        if (err) {
            return res.status(500).json({
                message: 'An error has occured'
            });
        }
        if (!offer) {
            return res.status(404).json({
                message: 'Offer not found'
            });
        } else {
            return res.status(200).json({
                message: 'Offer deleted!'
            });
        }
    });
});

router.patch('/edit/:id', verifyTokenMiddleware, (req, res) => {
    if (req.tokenDecoded.typeOfUser !== 'admin') {
        return res.status(403).json({
            message: 'Παρουσιάστηκε κάποιο σφάλμα',
            error  : {message: 'Δεν έχετε δικαίωμα πρόσβασης'}
        });
    }
    const {id}                                   = req.params.id;
    const {title, description, language, status} = req.body;
    const data                                   = {
        title      : title,
        description: description,
        language   : language,
        status     : status
    };
    Offer.findOneAndUpdate(id, {$set: data}, (err, offer) => {
        if (err) {
            return res.status(500).json({
                message: 'An error has occured'
            });
        }
        if (!offer) {
            return res.status(404).json({
                message: 'Offer not found'
            });
        } else {
            return res.status(200).json(offer);
        }
    });
});

module.exports = router;
