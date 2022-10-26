const User = require('../models/user')
const jwt = require('jsonwebtoken')
const Product = require('../models/product')
const Cart = require('../models/cart')
require('dotenv').config()
const client = require('twilio')(process.env.accountSid, process.env.authToken)

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

module.exports.homepage_get = async (req, res) => {
    try {
        const products = await Product.find({})
        res.render('./users/index', { product: products, layout: './layout/layout.ejs' })
    } catch (err) {
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
    // console.log(req.body);

    try {
        const user = await User.create({ username, email, password, phoneNo: phoneNo })

        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user });

    }

    catch (errors) {
        const errorHandler = handleErrors(errors);
        res.status(400).json({ errorHandler })
        console.log('error in signup');
    }
}

module.exports.sendOtp = async (req, res) => {
    const data = req.body;
    // console.log(data.phoneNo);
    await client.verify.services(process.env.serviceID)
        .verifications
        .create({ to: `+91${req.body.phoneNo}`, channel: 'sms' })
        .then(verification => console.log(verification.status))
        .catch(e => {
            console.log(e);
            res.status(500).send(e)
        })
    res.sendStatus(200)
}

module.exports.otpVerification = async (req, res) => {
    console.log(req.body);
    const check = await client.verify.services(process.env.serviceID)
        .verificationChecks
        .create({ to: `+91${req.body.phoneNo}`, code: req.body.otp })
        .catch(e => {
            console.log(e);
            res.status(500).send(e)
        })
    console.log(check.status);
    if (check.status === 'approved') {
        let username = req.body.username;
        await User.findOneAndUpdate({ username: username }, { isVerified: true });
    }
    res.status(200).json(check.status)
    console.log(check.status);
}


module.exports.userlogin_post = async (req, res) => {


    try {
        const { username, password } = req.body;
        const user = await User.login(username, password)
        const token = createToken(user._id);
        // console.log('token passed');
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




module.exports.dryfruits_get = (req, res) => {
    res.render('./users/dryfruits')
}

module.exports.beverages_get = (req, res) => {
    res.render('./users/beverages')
}



// module.exports.checkout_post = (req,res,next)=>{
//     const addedProduct = Product.findById(req.body.id)

// }

module.exports.add_to_cart_post = (req, res, next) => {

    const id = req.body.id;
    const addedProduct = Product.findById(req.body.id)

}

module.exports.payment_get = (req, res) => {

    res.render('./users/payment')
}



module.exports.cooking_get = async (req, res) => {
    try {
        //   let User = req.user.id
        //    console.log(User);
        const products = await Product.find({})
        res.render('./users/cooking', { product: products, layout: './layout/layout.ejs' })

    } catch (err) {
        console.log(err);
    }

}

module.exports.cooking_post = async (req, res) => {

    const id = req.body.id;
    // console.log(id);

    let userr = req.user.id


    let product = await Product.findOne({ _id: id })
    product = product.toJSON()
    product.count = 1;

    const userid = await User.findById({ _id: req.user.id })
    const checks = userid.cart;
    // console.log(checks);
    
    let n = 0;
    for (const check of checks) {
        if (check._id == id) {
            await User.updateOne({ _id: req.user.id, 'cart._id': req.body.id },
                { $inc: { "cart.$.count": 1 } })
            n++
        }
    }
    if (n > 0) {
        res.redirect('back')
    }
    else {
        const neww = await User.updateOne({ _id: req.user.id }, { $push: { cart: product } })
        // console.log('in else block');
        res.redirect('back')
    }

}

module.exports.checkout_get = async (req, res) => {


    try {
        let Curuser = req.user.id
        // console.log(Curuser);

        const users = await User.findById({ _id: Curuser })
        // console.log(users);
        const sum = function(items,p1,p2){
            return items.reduce(function (a,b){
                return parseInt(a)+(parseInt(b[p1])*parseInt(b[p2]))
            },0)
        }
        const total = sum(users.cart,'price','count')

        res.render('./users/checkout', { user: users.cart,totals:total,layout: './layout/layout.ejs' })

    } catch (err) {
        console.log(err);

    }

}

module.exports.wishlistGet = async (req, res) => {

    const prodId = req.params.id
    // console.log(prodId);
    let product = await Product.findById(prodId)
    product = product.toJSON()
    product.count = 1;


    let userr = req.user.id

    const userid = await User.findById({ _id: userr })

    const checks = userid.wishlist;
    // console.log(checks);
    let n = 0;
    for (const check of checks) {
        if (check._id == prodId) {
            await User.updateOne({ _id: userr, 'wishlist._id': req.params.id },
                { $inc: { "wishlist.$.count": 1 } })
            n++
        }
    }
    if (n > 0) {
        res.redirect('back')
    }
    else {
        const neww = await User.updateOne({ _id: req.user.id }, { $push: { wishlist: product } })
        // console.log('in else block');
        res.redirect('back')
    }


}

module.exports.wishlistView = async (req, res) => {
    try {
        let CurrentUser = req.user.id

        const users = await User.findById({ _id: CurrentUser })
        res.render('./users/wishlist', { user: users.wishlist, layout: './layout/layout.ejs' })

    } catch (err) {
        console.log(err);
    }


}

module.exports.removeFromCart = async (req, res) => {

    let prodId = req.params.id
    // console.log(prodId);
    let product = await Product.findById(prodId)
    // console.log(product);

    let userr = req.user.id
    // console.log(userr);

    const userid = await User.findById({ _id: userr })

    const checks = userid.cart;
    // console.log(checks);
    let n = 0;
    for (const check of checks) {
        if (check._id == prodId && check.count > 1) {
            await User.updateOne({ _id: userr, 'cart._id': req.params.id },
                { $inc: { "cart.$.count": -1 } })
            n++
        }
    }
    if (n > 0) {
        res.redirect('back')
    }
    else {
        await User.findOneAndUpdate({ _id: userr }, { $pull: { cart: { _id: prodId } } })
        res.redirect('/checkout')

    }

}

module.exports.addtoCart = async (req, res) => {

    const prodId = req.params.id
    let product = await Product.findById(prodId)
    
    let userr = req.user.id
    const userid = await User.findById({ _id: userr })

    const checks = userid.cart;
    let n = 0;
    for (const check of checks) {
        if (check._id == prodId) {
            await User.updateOne({ _id: userr, 'cart._id': req.params.id },
                { $inc: { "cart.$.count": 1 } })
            n++
        }
    }
    if (n > 0) {
        res.redirect('back')
    }
    else {
        const neww = await User.updateOne({ _id: req.user.id }, { $push: { cart: product } })
        res.redirect('back')
    }

}

module.exports.singleProduct = async (req, res) =>{

    try{
        let prodId = req.params.prodId;
        console.log(prodId);
    

        const products = await Product.findById({ _id: prodId})
        console.log(products);
      
    
        res.render('./users/single', {product: products, layout:'./layout/layout.ejs'})

    } catch (err) {
        console.log(err);
    }



}



