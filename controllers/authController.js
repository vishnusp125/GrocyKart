const User = require('../models/user')
const jwt = require('jsonwebtoken')
const Product = require('../models/product')
require('dotenv').config()
const client = require('twilio')(process.env.accountSid,process.env.authToken)

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

module.exports.homepage_get = async(req, res) => {
    try{
        const products = await Product.find({})
        res.render('./users/index', { product:products, layout: './layout/layout.ejs' })
    }catch(err){
        console.log(err);
    }
   
}

module.exports.usersignup_get = (req, res) => {
    res.render('./users/user-signup.ejs')
}

module.exports.userlogin_get = (req, res) => {
    res.render('./users/user-signin.ejs')
}

module.exports.usersignup_post = async (req, res) => {
    console.log('test in signup');

    const { username, email, password, phoneNo } = req.body;
    console.log(req.body);

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

module.exports.sendOtp = async (req,res) =>{
    const data = req.body;
     console.log(data.phoneNo);  
    await client.verify.services(process.env.serviceID)
    .verifications
    .create({to:`+91${req.body.phoneNo}`,channel:'sms'})
    .then(verification => console.log(verification.status))
    .catch(e =>{
        console.log(e);
        res.status(500).send(e)
    })
    res.sendStatus(200)   
}

module.exports.otpVerification = async (req,res) =>{
    console.log(req.body);
    const check = await client.verify.services(process.env.serviceID)
    .verificationChecks
    .create({to:`+91${req.body.phoneNo}`,code:req.body.otp})
    .catch(e=>{
        console.log(e);
        res.status(500).send(e)
    })
    console.log(check.status);
    if(check.status === 'approved'){
        let username = req.body.username;
        await User.findOneAndUpdate({username:username},{isVerified:true});
    }
    res.status(200).json(check.status)
    console.log(check.status);
}


module.exports.userlogin_post = async (req, res) => {


    try {
        const { username, password } = req.body;
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

module.exports.products_get = (req,res) =>{
    res.render('./users/products')
}

module.exports.checkout_get = (req,res)=>{

    res.render('./users/checkout')
}

module.exports.payment_get = (req,res)=>{

    res.render('./users/payment')
}


