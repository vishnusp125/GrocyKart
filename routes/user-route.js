const router = require('express').Router()
const authController = require('../controllers/authController')
const requireAuth = require('../middleware/authMiddleware')
const checkUser = require('../middleware/authMiddleware')
// const client = require('twilio')(process.env.accountSid,process.env.authToken)


router.get('/',checkUser.checkUser,authController.homepage_get)
router.get('/usersignup',authController.usersignup_get)
router.post('/usersignup',authController.usersignup_post)
router.get('/userlogin',requireAuth.requireAuth,authController.userlogin_get)
router.post('/userlogin',authController.userlogin_post)
router.get('/logout',authController.logout_get)
router.post('/sendnotification',authController.sendOtp)
router.post('/verify-otp',authController.otpVerification)

router.get('/cart',authController.cart_get)
// router.post('/checkout',authController.checkout_post)
router.get('/payment',authController.payment_get)
router.get('/cooking',authController.cooking_get)
router.post('/cooking',authController.cooking_post)
router.get('/dryfruits',authController.dryfruits_get)
router.get('/beverages',authController.beverages_get)

//wishlist
router.get('/wishlist/:id',authController.wishlistGet)
router.get('/wishlist',authController.wishlistView)
router.get('/wishlistdelete/:id',authController.wishlistDelete)


//cart
router.get('/removeFromcart/:id',authController.removeFromCart)
router.get('/addtoCart/:id',authController.addtoCart)
router.get('/removecart/:id',authController.removeCart)



//single product view
router.get('/singleProduct',authController.singleProduct)


//user profile
router.get('/userProfile',authController.userProfile)
router.get('/userProfileEdit',authController.userProfileEdit)
router.post('/userProfileEdit/:id',authController.userProfilePost)

//checkout
router.get('/checkout',authController.checkoutGet)
router.post('/checkout',authController.checkoutPost)
router.get('/ordersuccess',authController.successGet)
 
//razorpay
router.get('/verifyPaymentRazorPay',authController.verifyPaymentRazorPay)
router.get('/saveOrder',authController.saveOrder)
router.get('/orderDetails',authController.orderDetails)
router.get('/cancelOrder/:id',authController.cancelOrder)


//paypal
router.post('/paymentPaypal',authController.paymentPaypal)
router.post('/verifyPaymentPaypal/:id/capture',authController.verifyPaymentPaypal)




















module.exports = router;