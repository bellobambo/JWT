const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const User = require('../Models/User.model');


module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {};
            const secret = process.env.ACCESS_TOKEN_SECRET; // Make sure this matches the JWT secret used elsewhere.
            const options = {
                expiresIn: "1h",
                issuer: "google.com",
                audience: userId,
            };
            jwt.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError);
                }
                resolve(token);
            });
        });
    }
};
