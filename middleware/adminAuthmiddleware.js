const jwt = require('jsonwebtoken')
const Admin = require('../models/admin')


const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt2
    //check jwt exists and verified
    if (token) {
        jwt.verify(token, 'secretforhashing2', (err, decodedToken) => {
            if (err) {
                // res.redirect('/userlogin')
                next()
            } else {
                // res.redirect('/admindash')
                next()
            }
        })
    } else {
        res.render('../views/admin/admin-signin.ejs', { layout: './layout/admin-layout.ejs', admin: false })
        next()
    }
}
//check current user
const checkAdmin = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'secretforhashing2', async (err, decodedToken) => {
            if (err) {
                res.locals.admin = null;
                next()
            } else {
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