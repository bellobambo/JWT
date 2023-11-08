const createError = require('http-errors')
const User = require('../Models/User.model')
const { authSchema } = require('../helpers/validation_schema')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_helper')
const client = require('../helpers/init_redis')



module.exports = {
    register: async (req, res, next) => {
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
            const refreshToken = await signRefreshToken(savedUser.id)
            res.send({ accessToken, refreshToken });
        } catch (error) {
            if (error.isJoi === true) {
                error.status = 422;
            }
            next(error);
        }
    },

    login :  async (req, res, next) => {
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
            const refreshToken = await signRefreshToken(user.id)
    
    
            res.send({ accessToken, refreshToken });
        } catch (error) {
            if (error.isJoi === true) {
                next(createError(400, "Invalid Username or Password"));
            } else {
                next(error);
            }
        }
    },

    refreshToken : async (req, res, next) => {
        try {
            const { refreshToken } = req.body; // Correct the typo 'request' to 'req'
            if (!refreshToken) {
                throw createError.BadRequest();
            }
            const userId = await verifyRefreshToken(refreshToken);
            const accessToken = await signAccessToken(userId);
            const refToken = await signRefreshToken(userId);
            res.send({ accessToken: accessToken, refreshToken: refToken });
        } catch (error) {
            next(error);
        }
    },

    logout : async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
    
            if (!refreshToken) {
                throw createError.BadRequest('Refresh token is missing');
            }
    
            const userId = await verifyRefreshToken(refreshToken);
    
            // Perform any necessary actions to log the user out, such as invalidating the refresh token.
    
            console.log(`Logged out user with ID: ${userId}`);
    
            res.status(204).send();
    
        } catch (error) {
            next(error);
        }
    },
}