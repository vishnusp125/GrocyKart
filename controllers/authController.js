const User = require('../models/user')
const jwt = require('jsonwebtoken')
const Product = require('../models/product')
const Coupon = require('../models/coupon')
const Banner = require('../models/banner')
require('dotenv').config()
const client = require('twilio')(process.env.accountSid, process.env.authToken)
const { v4: uuidv4 } = require('uuid')
const Razorpay = require('razorpay')

//paypal
const fetch = require('node-fetch')
const base = "https://api-m.sandbox.paypal.com";



const { handleErrors } = require('../middleware/errHandlingMiddleware')
const { loginhandleErrors } = require('../middleware/errHandlingMiddleware');
const { checkUser } = require('../middleware/authMiddleware');

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});


const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'secretforhashing',
        {
            expiresIn: maxAge
        });
}

module.exports.homepage_get = async (req, res) => {
    try {
        const banners = await Banner.find()
        const products = await Product.find({})
        res.render('./users/index', { banner: banners, product: products, layout: './layout/layout.ejs' })
    } catch (err) {
        console.log(err);
    }

}

module.exports.usersignup_get = (req, res) => {
    res.render('./users/user-signup.ejs')
}

module.exports.usersignup_post = async (req, res) => {
    const { username, email, password, phoneNo } = req.body;

    try {
        const user = await User.create({ username, email, password, phoneNo: phoneNo })

        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user });

    }

    catch (errors) {
        const errorHandler = handleErrors(errors);
        res.status(400).json({ errorHandler })
    }
}

module.exports.sendOtp = async (req, res) => {
    const data = req.body;
    await client.verify.services(process.env.serviceID)
        .verifications
        .create({ to: `+91${req.body.phoneNo}`, channel: 'sms' })
        .then(verification => console.log(verification.status))
        .catch(e => {
            res.status(500).send(e)
        })
    res.sendStatus(200)
}

module.exports.otpVerification = async (req, res) => {
    const check = await client.verify.services(process.env.serviceID)
        .verificationChecks
        .create({ to: `+91${req.body.phoneNo}`, code: req.body.otp })
        .catch(e => {
            res.status(500).send(e)
        })

    if (check.status === 'approved') {
        let username = req.body.username;
        await User.findOneAndUpdate({ username: username }, { isVerified: true });
    }
    res.status(200).json(check.status)
}


module.exports.userlogin_post = async (req, res) => {

    try {
        const { username, password } = req.body;
        const user = await User.login(username, password)
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ user })

    }
    catch (errors) {
        const errorHandler = loginhandleErrors(errors);
        res.status(400).json({ errorHandler })
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/');

}


module.exports.add_to_cart_post = (req, res, next) => {

    const id = req.body.id;
    const addedProduct = Product.findById(req.body.id)
}

module.exports.payment_get = (req, res) => {

    res.render('./users/payment')
}



module.exports.cooking_get = async (req, res) => {
    try {
        const products = await Product.find({})
        res.render('./users/products', { products: products, layout: './layout/layout.ejs' })

    } catch (err) {
        console.log(err);
    }

}

module.exports.cooking_post = async (req, res) => {

    const id = req.body.id;
    let userr = req.user.id
    let product = await Product.findOne({ _id: id })
    product = product.toJSON()
    product.count = 1;
    const userid = await User.findById({ _id: req.user.id })
    const checks = userid.cart;
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
        res.redirect('back')
    }
}

module.exports.cart_get = async (req, res) => {

    try {
        let Curuser = req.user.id
        const users = await User.findById({ _id: Curuser })
        let cart = users
        const sum = function (items, p1, p2) {
            return items.reduce(function (a, b) {
                return parseInt(a) + (parseInt(b[p1]) * parseInt(b[p2]))
            }, 0)
        }
        const total = sum(users.cart, 'discountedPrice', 'count')
        res.render('./users/cart', { user: users.cart, totals: total, cartUser: cart, layout: './layout/layout.ejs' })
    } catch (err) {
        console.log(err);
    }
}

module.exports.wishlistGet = async (req, res) => {

    const prodId = req.params.id
    let product = await Product.findById(prodId)
    product = product.toJSON()
    product.count = 1;
    let userr = req.user.id
    const userid = await User.findById({ _id: userr })
    const checks = userid.wishlist;
    let n = 0;
    for (const check of checks) {
        if (check._id == prodId) {
            n++
        }
    }
    if (n > 0) {
        res.redirect('back')
    }
    else {
        const neww = await User.updateOne({ _id: req.user.id }, { $push: { wishlist: product } })
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

module.exports.wishlistDelete = async (req, res) => {

    try {
        let user = req.user.id
        const wishlistId = req.params.id

        await User.deleteOne({ _id: wishlistId })
        await User.findOneAndUpdate({ _id: user }, { $pull: { wishlist: { _id: wishlistId } } })
        res.redirect('/wishlist')

    } catch (err) {
        console.log(err);
    }
}


module.exports.removeFromCart = async (req, res) => {

    let prodId = req.params.id
    let product = await Product.findById(prodId)


    let userr = req.user.id


    const userid = await User.findById({ _id: userr })

    const checks = userid.cart;

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
        res.redirect('/cart')

    }

}

module.exports.addtoCart = async (req, res) => {
    const prodId = req.params.id
    let product = await Product.findById(prodId)
    const userr = req.user.id
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

        product = product.toJSON()

        product.count = 1;
        totals = product.count * product.discountedPrice
        const neww = await User.updateOne({ _id: req.user.id }, { $push: { cart: product } })
        res.redirect('back')
    }

}

module.exports.removeCart = async (req, res) => {
    const prodId = req.params.id
    let product = await Product.findById(prodId)
    const userr = req.user.id
    const userid = await User.findById({ _id: userr })

    await User.findOneAndUpdate({ _id: userr }, { $pull: { cart: { _id: prodId } } })
    res.redirect('back')
}


module.exports.singleProduct = async (req, res) => {

    try {
        let prodId = req.query.id;
        const product = await Product.findById(prodId)
        res.render('./users/single', { product, layout: './layout/layout.ejs' })
    } catch (err) {
        console.log(err);
        res.render('./users/404', { layout: false })
    }
}


module.exports.userProfile = async (req, res) => {

    let user = req.user.id


    await User.findById({ _id: user }).then((profile) => {
        res.render('./users/profile', { profile, layout: './layout/layout.ejs' })
    })
}

module.exports.userProfileEdit = async (req, res) => {

    const user = req.user.id;
    const profile = await User.findById({ _id: user })

    res.render('./users/edit_profile', { profile, layout: './layout/layout.ejs' })

}

module.exports.addressEdit = async (req, res) => {
    const user = req.user.id;
    const addressid = req.params.id
    const profile = await User.findOne({ _id: user })
    const checks = profile.address;
    let n = 0;
    let check;
    for (check of checks) {
        if (check._id == addressid) {
            n++;
            break;
        }
    }
    if (n > 0) {
        res.render('./users/editAddress', { check, layout: './layout/layout.ejs' })
    } else {
        res.redirect('back')
    }
}

module.exports.addressEditpost = async (req, res) => {
    try {
        const user = req.user.id;
        const checks = req.body;
        await User.updateOne({ _id: user, "address._id": req.body.addressid },
            {
                $set: {
                    'address.$.address': checks.address,
                    'address.$.city': checks.city,
                    'address.$.country': checks.country,
                    'address.$.state': checks.state,
                    'address.$.zip': checks.zip
                }
            })
        res.redirect('/userProfile')

    } catch (err) {
        console.log(err);

    }
}


module.exports.userProfilePost = async (req, res) => {

    try {
        const user = req.user.id;
        const checks = req.body;

        const userid = await User.findById({ _id: user })

        await User.updateOne({ _id: user },
            {
                $set: {
                    address: {
                        address: checks.address,
                        city: checks.city,
                        country: checks.country,
                        state: checks.state,
                        zip: checks.zip,
                    }, username: checks.username,
                    email: checks.email,
                    phoneNo: checks.phoneNo,

                }
            })
        res.redirect('back')

    } catch (err) {
        console.log(err);
    }
}

module.exports.addAddress = async (req, res) => {

    const user = req.user.id;
    const profile = await User.findById({ _id: user })
    res.render('./users/addAddress', { profile, layout: './layout/layout.ejs' })
}

module.exports.addAddresspost = async (req, res) => {

    try {
        const user = req.user.id;
        const checks = req.body;
        const userid = await User.findById({ _id: user })
        await User.updateOne({ _id: user },
            {
                $push: {
                    address: {
                        address: checks.address,
                        city: checks.city,
                        country: checks.country,
                        state: checks.state,
                        zip: checks.zip,
                    }

                }
            })
        res.redirect('back')

    } catch (err) {
        console.log(err);
    }
}

module.exports.addressDelete = async (req, res) => {
    const addressid = req.params.id
    try {
        const user = req.user.id;
        const userid = await User.findById({ _id: user })
        await User.findOneAndUpdate({ _id: user }, { $pull: { address: { _id: addressid } } })
        res.redirect('/userProfile')
    } catch (err) {
        console.log(err);
    }
}

let total;

module.exports.checkoutGet = async (req, res) => {

    try {

        const user = req.user.id;
        const Curuser = await User.findById({ _id: user })
        const coupon = await Coupon.find()

        const sum = function (items, p1, p2) {
            return items.reduce(function (a, b) {
                return parseInt(a) + parseInt(b[p1] * parseInt(b[p2]))
            }, 0)

        }
        total = sum(Curuser.cart, 'discountedPrice', 'count')
        const thisuser = Curuser;

        res.render('./users/checkout', { coupon, user: Curuser.cart, totals: total, profile: thisuser, layout: './layout/layout.ejs' })

    } catch (err) {
        console.log(err);
    }

}

let coupon;
module.exports.applyCouponpost = async (req, res) => {

    coupon = req.body.couponCode
    total = req.body.total
    const coupondata = await Coupon.findOne({ couponCode: coupon })


    if (coupondata.users.length !== 0) {
        const isExisting = coupondata.users.findIndex(users => users == req.user.id)
        if (total >= coupondata.minBill && isExisting === -1) {
            discountedTotal = total - coupondata.couponValue;
            let couponValue = coupondata.couponValue;
            res.json({ discountedTotal, couponValue, total })
        } else {
            res.json({ error: true, msg: 'Already used this coupon' })
        }
    } else {
        if (total >= coupondata.minBill) {
            discountedTotal = total - coupondata.couponValue;
            let couponValue = coupondata.couponValue;
            res.json({ discountedTotal, couponValue, total })
        } else {
            res.json({ error: true, msg: 'Purchase amount is not enough' })
        }
    }

}

let payment;
let address;
let zip;
let country;
let state;
let discountedTotal = 0;
let paymentPaypalAmount;

module.exports.checkoutPost = async (req, res) => {

    const user = req.user.id;
    const result = await User.findOne({ _id: user })
    address = req.body.address || req.body.addressopt
    payment = req.body.payment
    zip = req.body.zip
    country = req.body.country
    state = req.body.state
    discountedTotal = req.body.discountedTotal

    if (payment == 'Razorpay') {
        //step 1
        let { amount, currency } = req.body;
        if (discountedTotal == 0) {
            total = amount;
        } else {
            amount = discountedTotal;
        }
        amount = amount * 100;
        //step 2
        instance.orders.create({ amount, currency }, (err, order) => {
            // step 3&4
            res.json(order)
        })

    } else if (payment == 'Paypal') {
        if (discountedTotal == 0) {
            paymentPaypalAmount = total
        } else {
            paymentPaypalAmount = discountedTotal
        }
        const order = { id: 'Paypal' }
        res.json(order)
    }
    else {
        res.redirect('/saveOrder')
    }
}

module.exports.verifyPaymentRazorPay = async (req, res) => {

    const crypto = require('crypto')

    // Creating hmac object
    let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)

    //passing the data to be hashed
    hmac.update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id)

    //creating the hmac in the required format
    const generated_signature = hmac.digest('hex')
    var response = { signatureIsValid: "false" }
    if (generated_signature === req.body.razorpay_signature) {
        response = { signatureIsValid: "true" }
        res.json(response)
    } else {
        res.send(response)
    }
}

module.exports.saveOrder = async (req, res) => {
    const user = req.user.id;
    try {

        const result = await User.findOne({ _id: user })
        const cartItems = result.cart

        for (let cartItem of cartItems) {
            cartItem = cartItem.toJSON()
            cartItem.address = address
            cartItem.zip = zip
            cartItem.country = country
            cartItem.state = state
            cartItem.paymentOption = payment
            cartItem.unique = uuidv4()
            cartItem.orderStatus = 'Order is under process'
            stockId = cartItem._id
            salesCount = cartItem.count
            removeCount = cartItem.count * -1

            await User.findOneAndUpdate({ _id: user }, { $push: { order: cartItem } }, { $set: { paymentOption: payment } })


            //empty cart
            await User.findOneAndUpdate({ _id: user }, { $set: { cart: [] } })

            //update stock

            await Product.updateOne({ "_id": stockId }, { $inc: { "stock": removeCount, "sales": salesCount } })

            await Coupon.updateOne({ couponCode: coupon }, {
                $push: { users: req.user.id }
            })

            res.status(200).json({ success: 'true' })
        }
    } catch (err) {
        console.log(err);
    }
}


module.exports.successGet = async (req, res) => {

    res.render('./users/orderSuccess', { layout: './layout/layout.ejs' })

}

module.exports.orderDetails = async (req, res) => {

    const user = req.user.id;
    try {
        const orderDetails = await User.findById({ _id: user })
        res.render('./users/orderDetails', { orderDetails, layout: './layout/layout.ejs' })

    } catch (err) {
        console.log(err);
    }

}

module.exports.cancelOrder = (req, res) => {

    const users = req.user.id
    uniqueid = req.params.id
    if (users) {

        User.findOne({ _id: users })
            .then((result) => {
                const orders = result.order

                for (let order of orders) {
                    order = order.toJSON();

                    if (order.unique === uniqueid) {

                        Promise.all([(User.updateOne({ "_id": users, "order.unique": uniqueid }, { $set: { "order.$.orderStatus": "Order cancelled" } })), (Product.updateOne({ "_id": order._id }, { $inc: { "stock": order.count, 'sales': (order.count * -1) } }))])
                            .then((result) => {
                                res.redirect('/orderDetails')
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    }
                }

            })

    } else {

    }
}

module.exports.returnOrder = async (req, res) => {
    const users = req.user.id
    uniqueid = req.params.id
    if (users) {
        User.findOne({ _id: users })
            .then((result) => {

                const orders = result.order
                for (let order of orders) {
                    order = order.toJSON();

                    if (order.unique === uniqueid) {

                        Promise.all([(User.updateOne({ "_id": users, "order.unique": uniqueid }, { $set: { "order.$.orderStatus": "Returned" } })), (Product.updateOne({ "_id": order._id }, { $inc: { "stock": order.count, 'sales': (order.count * -1) } }))])
                            .then((result) => {
                                res.redirect('/orderDetails')
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    }
                }

            })

    } else {
    }
}



module.exports.paymentPaypal = async (req, res) => {
    const { amount, currency } = req.body;
    let orderAmt = paymentPaypalAmount / 80
    let orderAmount = (Math.round(orderAmt * 100) / 100).toFixed(2);
    const order = await createOrder(orderAmount);
    res.json(order);
}


// capture payment & store order information or fullfill order
module.exports.verifyPaymentPaypal = async (req, res) => {
    const orderID = req.params.id;
    const captureData = await capturePayment(orderID);
    // TODO: store payment information such as the transaction ID
    res.json(captureData);
}

/////////////////////
// PayPal API helpers
//////////////////////

// use the orders api to create an order
async function createOrder(orderAmount) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const response = await fetch(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: orderAmount,
                    },
                },
            ],
        }),
    });
    const data = await response.json();
    return data;
}

// use the orders api to capture payment for an order
async function capturePayment(orderId) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();
    return data;
}

// generate an access token using client id and app secret
async function generateAccessToken() {
    const auth = Buffer.from(process.env.paypalClientid + ":" + process.env.paypalClientsecret).toString("base64")
    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "post",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });
    const data = await response.json();
    return data.access_token;
}











