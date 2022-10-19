const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requireAuth = (req, res, next) => {
    console.log('checking reqauth');
    const token = req.cookies.jwt

    //check jwt exists and verified

    if (token) {
        jwt.verify(token, 'secretforhashing', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                // res.redirect('/userlogin')
                next()
            } else {
                console.log(decodedToken);
                console.log('decoded token');
                res.redirect('/')
                // next()

            }

        })

    } else {
        console.log('no token');
        // res.redirect('/userlogin')
        next()

    }
}

//check current user

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, 'secretforhashing', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next()
            } else {
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id)
                res.locals.user = user;
                next()

            }

        })

    } else {
        res.locals.user = null;
        next()

    }
}

module.exports = { requireAuth, checkUser }