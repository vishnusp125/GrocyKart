const User = require('../models/user')
const jwt = require('jsonwebtoken')
const Product = require('../models/product')
const Cart = require('../models/cart')
require('dotenv').config()
const client = require('twilio')(process.env.accountSid, process.env.authToken)
const {v4 : uuidv4} = require('uuid')
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
        const products = await Product.find({})
        res.render('./users/index', { product: products, layout: './layout/layout.ejs' })
    } catch (err) {
        console.log(err);
    }

}

module.exports.usersignup_get = (req, res) => {
    res.render('./users/user-signup.ejs')
}

// module.exports.userlogin_get = (req, res) => {
//     res.render('./users/user-signin.ejs')
// }

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
        // const dry = await Product.find({$match:{$category}})
        const products = await Product.find({})
        
        res.render('./users/products', { products: products, layout: './layout/layout.ejs' })

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

module.exports.cart_get = async (req, res) => {


    try {
        let Curuser = req.user.id
        // console.log(Curuser);

        const users = await User.findById({ _id: Curuser })
        // console.log(users);
        let cart = users
        const sum = function(items,p1,p2){
            return items.reduce(function (a,b){
                return parseInt(a)+(parseInt(b[p1])*parseInt(b[p2]))
            },0)
        }
       
        const total = sum(users.cart,'price','count')
        console.log(total);

        res.render('./users/cart', { user: users.cart,totals:total,cartUser:cart, layout: './layout/layout.ejs' })

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

module.exports.wishlistDelete = async (req, res) => {

    try {
        let user = req.user.id
        const wishlistId = req.params.id
      
        await User.deleteOne({ _id: wishlistId })
        await User.findOneAndUpdate({ _id:user }, { $pull: { wishlist: { _id: wishlistId } } })
        res.redirect('/wishlist')

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
        res.redirect('/cart')

    }

}

module.exports.addtoCart = async (req, res) => {

    const prodId = req.params.id
    console.log(prodId);
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
        const neww = await User.updateOne({ _id: req.user.id }, { $push: { cart: product } })
        res.redirect('back')
    }

}

module.exports.removeCart = async (req, res) => {

    const prodId = req.params.id
    console.log(prodId);
    let product = await Product.findById(prodId)
    
    const userr = req.user.id
    const userid = await User.findById({ _id: userr })

    await User.findOneAndUpdate({ _id: userr }, { $pull: { cart: { _id: prodId } } })
     res.redirect('back')




}


module.exports.singleProduct = async (req, res) =>{

    try{
        let prodId = req.query.id;
        console.log(prodId);
    

        const product = await Product.findById(prodId)
        console.log(product);
      
    
        res.render('./users/single', {product, layout:'./layout/layout.ejs'})

    } catch (err) {
        console.log(err);
    }

}




module.exports.userProfile = async (req, res) =>{

    let user = req.user.id
//     console.log(user);
//    let user1 = user.username
//    console.log(user1);

    await User.findById({_id:user}).then((profile) => {
        res.render('./users/profile', {profile,layout:'./layout/layout.ejs'})
    })
}

module.exports.userProfileEdit = async (req, res) =>{

    const user = req.user.id;
    const profile = await User.findById({ _id:user })

    res.render('./users/edit_profile', {profile,layout:'./layout/layout.ejs'})

}

module.exports.userProfilePost = async (req, res) => {

  
    // console.log(user);
    // let userdetails = req.body;
    // console.log(userdetails);

    try {
        const user = req.user.id;
        const checks = req.body;
    
        const userid = await User.findById({ _id: user })
    
            await User.updateOne({ _id: user },
                 { $set: {address:{
                    address:checks.address,
                    city:checks.city,
                    country:checks.country,
                    state:checks.state,
                    zip : checks.zip,
                },username:checks.username,
                email:checks.email,
                phoneNo:checks.phoneNo,

                   }
                })
            res.redirect('back')

    } catch (err) {
        console.log(err);

    }

}

module.exports.addAddress = async (req, res) => {

    const user = req.user.id;
    const profile = await User.findById({ _id:user })

    res.render('./users/addAddress', {profile,layout:'./layout/layout.ejs'})


}

module.exports.addAddresspost = async (req, res) => {

try {
    const user = req.user.id;
    const checks = req.body;

    const userid = await User.findById({ _id: user })

        await User.updateOne({ _id: user },
             { $push: {address:{
                address:checks.address,
                city:checks.city,
                country:checks.country,
                state:checks.state,
                zip : checks.zip,
            }

               }
            })
        res.redirect('back')

} catch (err) {
    console.log(err);

}
}



module.exports.checkoutGet = async (req, res) => {

    try{

        const user = req.user.id;
        console.log(user);
        const Curuser = await User.findById({_id:user})

        const sum = function(items,p1,p2){
            return items.reduce(function(a,b){
                return parseInt(a)+parseInt(b[p1]*parseInt(b[p2]))
            },0)

        }
        const total = sum(Curuser.cart,'price','count')
            const thisuser = Curuser;
        
        res.render('./users/checkout', {user:Curuser.cart, totals: total, profile:thisuser, layout:'./layout/layout.ejs'})

    }catch (err){  
        console.log(err);
    }
  
}

let payment;
let address;
let zip;
let country;
let state;
module.exports.checkoutPost = async (req, res) => {
    console.log(1111);
   
    
    
        const user = req.user.id;
      
        const result = await User.findOne({_id:user})
        const cartItems = result.cart
        console.log(cartItems);
        
        address = req.body.address||req.body.addressopt
        payment = req.body.payment
        zip = req.body.zip
        country = req.body.country
        state = req.body.state
        let amount = req.body.amount
        let currency = req.body.currency
        console.log(address);
        console.log(amount);
        console.log(currency);

        if(payment == 'Razorpay'){

            //step 1

            let {amount, currency } = req.body;
            amount = amount * 100;
            console.log(amount);
            console.log(currency);

            //step 2
            instance.orders.create({amount,currency},(err,order) =>{
           // step 3&4

                console.log(order);
                console.log(order.amount)
                console.log(order.id)
                console.log(typeof order.id);
                res.json(order)
            })

        }else if(payment == 'Paypal'){
            console.log('in paypal');
            const order = {id:'Paypal'}
            console.log(order);
            res.json(order)

        }
         
        else{

            res.redirect('/saveOrder')
        }

            

    
 
}

module.exports.verifyPaymentRazorPay = async (req,res) => {
console.log(111111111);
    console.log(req.body) 
    console.log(req.body.razorpay_payment_id);
    console.log(req.body.razorpay_order_id);
    console.log(req.body.razorpay_signature);
    console.log('before creating hmac object');
    const crypto = require('crypto')

// Creating hmac object
    let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)

  //passing the data to be hashed
  hmac.update(req.body.razorpay_order_id +"|" + req.body.razorpay_payment_id)

  //creating the hmac in the required format
  const generated_signature = hmac.digest('hex')
  console.log('after creating hmac');

  var response = { signatureIsValid: "false" }
  if (generated_signature === req.body.razorpay_signature) {
    response = { signatureIsValid : "true" }
    console.log('signatureIsValid');
    res.json(response)
  }else {
    res.send(response)
  }

}

module.exports.saveOrder = async (req, res) => {

    const user = req.user.id;

    // address = req.body.address
    // payment = req.body.payment
    console.log(address);
    
     try{

    
    const result = await User.findOne({_id:user})
    const cartItems = result.cart


          for (let cartItem of cartItems){
                cartItem = cartItem.toJSON()
                cartItem.address = address 
                cartItem.zip = zip  
                cartItem.country = country  
                cartItem.state = state   
                cartItem.paymentOption =  payment
                cartItem.unique = uuidv4() 
                cartItem.orderStatus = 'Order is under process'
                stockId = cartItem._id
                salesCount = cartItem.count
                removeCount = cartItem.count * -1 

                await User.findOneAndUpdate({_id:user},{$push:{ order: cartItem}},{$set:{ paymentOption: payment}})  
             

                //empty cart
                await User.findOneAndUpdate({ _id:user },{$set:{cart:[]}})

                //update stock

                await Product.updateOne({"_id": stockId},{$inc:{"stock":removeCount,"sales": salesCount}})

                res.status(200).json({ success:'true'})
          }
          }catch (err){
            console.log(err);
          }
            


}



module.exports.successGet = async (req, res) => {

    res.render('./users/orderSuccess', { layout:'./layout/layout.ejs'})
    
}

module.exports.orderDetails = async (req, res) => {

    const user = req.user.id;
    console.log(user);

    try{
        const orderDetails =  await User.findById({_id:user})
        res.render('./users/orderDetails', { orderDetails,layout:'./layout/layout.ejs'})

    }catch (err){
        console.log(err);
    }  
    
}

module.exports.cancelOrder =  (req, res) => {

    const user = req.user.id
    // console.log(user);
  

    uniqueid = req.params.id
    // console.log(uniqueid);
    if (user) {
        User.findOne({user:uniqueid})
        .then((result) =>{
            // console.log(result);

            const orders = result.order

            // console.log(orders);  

                    for (let order of orders) {
                    order = order.toJSON();
                    if (order.unique === uniqueid) {
                        Promise.all([(User.updateOne({ "_id":user, "order.unique": uniqueid }, { $set: { "order.$.orderStatus": "Order cancelled" } })), (Product.updateOne({ "_id": order._id }, { $inc: { "stock": order.count, 'sales':(order.count*-1) } }))])
                            .then((result) => {
                                res.redirect('/orderDetails')
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    }
                }

        })

    }else{

    }
}


// const cancelOrderGet = (req, res) => {
//     session = req.session;
//     uniqueId = req.params.id;
//     if (session.userId) {
//         User.findOne({ _id: session.uid })
//             .then((result) => {
//                 // console.log(result)

//                 const orders = result.order

//                 console.log(orders)

//                 for (let order of orders) {
//                     order = order.toJSON();
//                     if (order.unique === uniqueId) {
//                         Promise.all([(User.updateOne({ "name": session.userId, "order.unique": uniqueId }, { $set: { "order.$.orderStatus": "Order cancelled" } })), (Product.updateOne({ "_id": order._id }, { $inc: { "stock": order.count, "sales": (order.count * -1) } }))])
//                             .then((result) => {
//                                 res.redirect('/order')
//                             })
//                             .catch((err) => {
//                                 console.log(err)
//                             })
//                     }
//                 }
//             })
//     } else {
//         res.redirect('/login')
//     }
// }





module.exports.paymentPaypal = async (req, res) => {

    console.log('in payment paypal');

    console.log(req.body);
    const { amount, currency } = req.body;
    console.log(amount)
    
    let orderAmt = amount / 80
    let orderAmount = (Math.round(orderAmt * 100) / 100).toFixed(2);
    console.log(orderAmount)
    console.log(typeof orderAmount)

    const order = await createOrder(orderAmount);
    console.log(order);
    console.log(order.id);
    console.log('in return data1');
    res.json(order);
    console.log('in return data2');

}


// capture payment & store order information or fullfill order
module.exports.verifyPaymentPaypal = async (req, res) => {
    console.log('in verify payment paypal');

    console.log(req.params)
    const orderID = req.params.id;
    console.log(orderID)
    const captureData = await capturePayment(orderID);
    // TODO: store payment information such as the transaction ID
    res.json(captureData);

}

/////////////////////
// PayPal API helpers
//////////////////////

// use the orders api to create an order
async function createOrder(orderAmount) {
    console.log('in paypal create order');
    console.log(1111111111);
    console.log(orderAmount)
    console.log(typeof orderAmount)
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
    console.log(2222222222);
    const data = await response.json();
    // console.log(data)
    console.log(3333333);
    return data;
}

// use the orders api to capture payment for an order
async function capturePayment(orderId) {
    console.log('in .... capture payment');
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
    console.log('in generateAccesstoken');
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











