const jwt = require('jsonwebtoken');
const secretKey = require('../config/config.js').secretKey;

let jwtAuthentication = {};

jwtAuthentication.createSign = (user) => {
    return new Promise((resolve, reject) => {
        const jwtOptions = {
            expiresIn: '17520h'
        };
        jwt.sign(user, secretKey, jwtOptions, (err, token) => {
            if (err) reject(err);
            resolve(token);
        });
    });
};

jwtAuthentication.verifyTokenMiddleware = (req, res, next) => {
    let token;
    const dateNow = new Date();
    
    if (req.headers.authorization) {
        let splitedAuthorization = req.headers.authorization.split(' ');
        if (splitedAuthorization.length === 2) {
            token = splitedAuthorization[1];
        }
    } else token = '';
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(401).send({message: 'Forbidden access'});
        req.tokenDecoded = decoded;
        next();
    });
};

module.exports = jwtAuthentication;