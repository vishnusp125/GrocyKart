const Admin = require('../models/admin')
const jwt = require('jsonwebtoken')


const { adminhandleErrors } = require('../middleware/admin-errorhandling')
const { loginhandleErrors } = require('../middleware/admin-errorhandling')

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'secretforhashing',
        {
            expiresIn: maxAge
        });
}

module.exports.adminsignup_get = (req, res) => {
    res.render('../views/admin/admin-signup.ejs', { layout: './layout/admin-layout.ejs', admin: false })
}

module.exports.adminlogin_get = (req, res) => {
    res.render('../views/admin/admin-signin.ejs', { layout: './layout/admin-layout.ejs', admin: false })
}

module.exports.adminsignup_post = async (req, res) => {
    console.log('in admin signup page');
    const { adminname, password } = req.body;
    console.log(req.body);


    try {
        const admin = await Admin.create({ adminname, password })
        console.log(req.body);
        console.log(admin);
        console.log('saving on db');
        const token = createToken(admin._id);
        console.log('token passed');
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ admin });
    }


    catch (errors) {
        console.log(errors)
        console.log('in error handler');
        const errorHandler = adminhandleErrors(errors);
        console.log(errorHandler);
        res.status(400).json({ errorHandler })
        console.log('error in signup');
    }
}
module.exports.adminsignin_post = async (req, res) => {

    console.log('in admin signin page');

    const { adminname, password } = req.body;
    console.log(req.body);

    try {
        const admin = await Admin.login(adminname, password)
        console.log(req.body);
        console.log('in try');
        const token = createToken(admin._id);
        console.log('token passed');
        res.cookie('jwt2', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ admin })

    }
    catch (errors) {

        const errorHandler = loginhandleErrors(errors);
        console.log(errorHandler);
        res.status(400).json({ errorHandler })
        console.log('error in signin');
    }

}

module.exports.adminLogout_get = (req,res)=>{
    res.cookie('jwt2','',{maxAge:1})
    res.redirect('/adminsignin');
}

