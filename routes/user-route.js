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

router.get('/checkout',authController.checkout_get)
router.get('/payment',authController.payment_get)
router.get('/products',authController.products_get)



module.exports = router;