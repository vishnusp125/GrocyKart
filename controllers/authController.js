const User = require('../models/user')
const jwt = require('jsonwebtoken')
// const userModel = require('../models/user')

const { handleErrors } = require('../middleware/errHandlingMiddleware')
const { loginhandleErrors } = require('../middleware/errHandlingMiddleware');
const { checkUser } = require('../middleware/authMiddleware');

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'secretforhashing',
        {
            expiresIn: maxAge
        });
}

module.exports.homepage_get = ('/', (req, res) => {
    res.render('./users/index', { layout: './layout/layout.ejs' })
})

module.exports.usersignup_get = (req, res) => {
    res.render('../views/users/user-signup.ejs')
}

module.exports.userlogin_get = (req, res) => {
    res.render('./users/user-signin.ejs')
}

module.exports.usersignup_post = async (req, res) => {
    console.log('test in signup');

    const { username, email, password, phoneNo } = req.body;

    try {
        const user = await User.create({ username, email, password, phoneNo: phoneNo })

        const token = createToken(user._id);
        // console.log('token passed');
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user });

    }

    catch (errors) {
        // console.log(err);
        const errorHandler = handleErrors(errors);
        // console.log(errorHandler);
        res.status(400).json({ errorHandler })
        console.log('error in signup');
    }
}
module.exports.userlogin_post = async (req, res) => {


    const { username, password } = req.body;

    try {
        const user = await User.login(username, password)
        const token = createToken(user._id);
        console.log('token passed');
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ user })

    }
    catch (errors) {

        const errorHandler = loginhandleErrors(errors);
        res.status(400).json({ errorHandler })
        console.log('error in signin');
    }

}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/');

}

