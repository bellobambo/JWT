const express = require('express')
const router = express.Router()
const createError = require('http-errors')
const User = require('../Models/User.model')
const { authSchema } = require('../helpers/validation_schema')
const { signAccessToken } = require('../helpers/jwt_helper')

router.post('/register', async (req, res, next) => {
    console.log(req.body);
    try {
        const result = await authSchema.validateAsync(req.body);

        const doesExist = await User.findOne({ email: result.email });
        if (doesExist) throw createError.Conflict(`${result.email} is already registered`);


        const user = new User({
            email: result.email,
            password: result.password,
        });

        const savedUser = await user.save();
        const accessToken = await signAccessToken(savedUser.id);
        res.send({ accessToken });
    } catch (error) {
        if (error.isJoi === true) {
            error.status = 422;
        }
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body);
        const user = await User.findOne({ email: result.email });

        if (!user) {
            throw createError(404, "User not registered");
        }

        const isMatched = await user.isValidPassword(result.password);
        if (!isMatched) {
            throw createError(401, "Username/Password not valid");
        }

        const accessToken = await signAccessToken(user.id)

        res.send({accessToken}); 
    } catch (error) {
        if (error.isJoi === true) {
            next(createError(400, "Invalid Username or Password"));
        } else {
            next(error);
        }
    }
});

router.post('/refresh-token', async (req, res, next) => {
    res.send("refresh-token route")
})

router.delete('/logout', async (req, res, next) => {
    res.send("logout route")
})


module.exports = router