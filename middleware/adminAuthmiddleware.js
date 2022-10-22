const jwt2 = require('jsonwebtoken')
const Admin = require('../models/admin')

const requireAuth = (req, res, next) => {
    console.log('checking reqauth');
    const token = req.cookies.jwt2

    //check jwt exists and verified

    if (token) {
        jwt2.verify(token, 'secretforhashing', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                // res.redirect('/userlogin')
                next()
            } else {
                console.log(decodedToken);
                console.log('decoded token');
                res.redirect('/admindash')
                // next()

            }

        })

    } else {
        console.log('no token');
        // res.redirect('/adminsignin')
        next()

    }
}

//check current user

const checkAdmin = (req, res, next) => {
    const token = req.cookies.jwt2;

    if (token) {
        jwt2.verify(token, 'secretforhashing', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.admin = null;
                next()
            } else {
                console.log(decodedToken);
                let admin = await Admin.findById(decodedToken.id)
                res.locals.admin = admin;
                next()

            }

        })

    } else {
        res.locals.admin = null;
        next()

    }
}

module.exports = { requireAuth, checkAdmin }