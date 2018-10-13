const express = require('express');
const router = express.Router();
const axios = require('axios');

const googlePlacesUrl = 'https://maps.googleapis.com/maps/api/place/textsearch'
const googlePaceDetailsUrl = 'https://maps.googleapis.com/maps/api/place/details'
const API_KEY = 'AIzaSyAmi8f7rTFX6wA9Y5XDUWMx6w_3Sfv_gOA'

// Get Places By Type
router.post('/byType', (req, res, next) => {
    let lat = req.body.lat
    let lng = req.body.lng
    let placeType = req.body.type

    axios
        .get(`${googlePlacesUrl}/json?location=${lat},${lng}&rankby=distance&type=${placeType}&key=${API_KEY}`)
        .then(response => {
            let results = response.data
            res.status(200).json(results);
        })
        .catch(error => {
            res.status(500).json({
                message: 'An error has occured'
            });
        })
});

// Get Places Next Page
router.post('/getNextPage', (req, res, next) => {

    let token = req.body.token

    axios
        .get(`${googlePlacesUrl}/json?pagetoken=${token}&key=${API_KEY}`)
        .then(response => {
            let results = response.data
            res.status(200).json(results);
        })
        .catch(error => {
            res.status(500).json({
                message: 'An error has occured'
            });
        })
});

// Get Single Place
router.post('/getSinglePlace', (req, res, next) => {
    axios
    .get(`${googlePaceDetailsUrl}/json?placeid=${req.body.placeId}&key=${API_KEY}`)
    .then(response => {
        res.status(200).json(response.data);
    })
    .catch(error => {
        // console.log(error)
        res.status(500).json({
            message: 'An error has occured'
        });
    })

    // let token = req.body.token
    // axios
    // .get(`${googlePlaceUrl}/json?placeid=${$stateParams.place_id}&key=${APIKEY}&language=${language}`)
    // axios
    //     .get(`${googlePlaceUrl}/json?pagetoken=${token}&key=${API_KEY}`)
    //     .then(response => {
    //         // console.log(response)
    //         let results = response.data
    //         res.status(200).json(results);
    //     })
    //     .catch(error => {
    //         // console.log(error)
    //         res.status(500).json({
    //             message: 'An error has occured'
    //         });
    //     })
});



module.exports = router;
