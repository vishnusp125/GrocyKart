const router = require('express').Router()
const authController = require('../controllers/authController')
const requireAuth = require('../middleware/authMiddleware')
const checkUser = require('../middleware/authMiddleware')
// const client = require('twilio')(process.env.accountSid,process.env.authToken)


router.get('/',checkUser.checkUser,authController.homepage_get)
router.get('/usersignup',authController.usersignup_get)
router.post('/usersignup',authController.usersignup_post)
router.get('/userlogin',requireAuth.requireAuth)
router.post('/userlogin',authController.userlogin_post)
router.get('/logout',authController.logout_get)
router.post('/sendnotification',authController.sendOtp)
router.post('/verify-otp',authController.otpVerification)

router.get('/cart',requireAuth.requireAuth, authController.cart_get)
router.get('/payment',requireAuth.requireAuth,authController.payment_get)
router.get('/products',authController.cooking_get)
router.post('/products',authController.cooking_post)
router.get('/dryfruits',authController.dryfruits_get)
router.get('/beverages',authController.beverages_get)

//wishlist
router.get('/wishlist/:id',requireAuth.requireAuth,authController.wishlistGet)
router.get('/wishlist',requireAuth.requireAuth,authController.wishlistView)
router.get('/wishlistdelete/:id',requireAuth.requireAuth,authController.wishlistDelete)


//cart
router.get('/removeFromcart/:id',requireAuth.requireAuth,authController.removeFromCart)
router.get('/addtoCart/:id',requireAuth.requireAuth,authController.addtoCart)
router.get('/removecart/:id',requireAuth.requireAuth,authController.removeCart)



//single product view
router.get('/singleProduct',authController.singleProduct)


//user profile
router.get('/userProfile',requireAuth.requireAuth,authController.userProfile)
router.get('/userProfileEdit',requireAuth.requireAuth,authController.userProfileEdit)
router.get('/addressEdit/:id',authController.addressEdit)
router.post('/addressEdit',authController.addressEditpost)
router.post('/userProfileEdit/:id',requireAuth.requireAuth,authController.userProfilePost)
router.get('/addAddress',requireAuth.requireAuth,authController.addAddress)
router.post('/addAddress/:id',requireAuth.requireAuth,authController.addAddresspost)




//checkout
router.get('/checkout',requireAuth.requireAuth,authController.checkoutGet)
router.post('/checkout',authController.checkoutPost)
router.get('/ordersuccess',authController.successGet)

//coupon
router.post('/applyCoupon',authController.applyCouponpost)

 
//razorpay
router.get('/verifyPaymentRazorPay',authController.verifyPaymentRazorPay)
router.get('/saveOrder',authController.saveOrder)
router.get('/orderDetails',authController.orderDetails)
router.get('/cancelOrder/:id',authController.cancelOrder)


//paypal
router.post('/paymentPaypal',authController.paymentPaypal)
router.post('/verifyPaymentPaypal/:id/capture',authController.verifyPaymentPaypal)























module.exports = router;