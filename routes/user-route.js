const router = require('express').Router()
const authController = require('../controllers/authController')
const requireAuth = require('../middleware/authMiddleware')
const checkUser = require('../middleware/authMiddleware')


// router.get('/',(req,res)=>{
//     res.render('./users/index',{layout:'./layout/layout.ejs'})
// })
// router.get('/',(req,res)=>{
//     res.render('./users/index',{layout:'./layout/layout.ejs'})
// })

router.get('/',checkUser.checkUser,authController.homepage_get)
router.get('/usersignup',authController.usersignup_get)
router.post('/usersignup',authController.usersignup_post)
router.get('/userlogin',requireAuth.requireAuth,authController.userlogin_get)
router.post('/userlogin',authController.userlogin_post)
router.get('/logout',authController.logout_get)



module.exports = router;