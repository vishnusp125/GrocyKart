const router = require('express').Router()
const { Router } = require('express')
const jwt = require('jsonwebtoken')
// const requireAuth = require('../middleware/admin-errorhandling')
const adminauthController = require('../controllers/admin-authController')
const productController = require('../controllers/productController')
const userController = require('../controllers/usercontroller')
const adminAuthmiddleware = require('../middleware/adminAuthmiddleware')





const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'secretforhashing',
     { expiresIn: maxAge 
    });
}


//admin sigup get and post
router.get('/adminsignup',adminauthController.adminsignup_get)
router.get('/adminsignin',adminAuthmiddleware.requireAuth,adminauthController.adminlogin_get)
router.post('/adminsignup',adminauthController.adminsignup_post)
router.post('/adminsignin',adminauthController.adminsignin_post)
router.get('/adminLogout',adminauthController.adminLogout_get)
router.get('/admindash',adminauthController.adminHome)

//productmgt
router.get('/adminproduct',productController.addproductform_get)
router.post('/adminproduct',productController.addproduct_post)
router.get('/viewproduct',productController.viewproduct_get)
router.get('/deleteproduct/:id',productController.productdelete_get)
router.get('/admineditproduct/:id',productController.editproduct_get)
router.post('/admineditproduct/:id',productController.editproduct_post)

//category
router.get('/categoryMgt',productController.categoryMgt)
router.post('/categoryMgtpost',productController.categoryMgtpost)
router.post('/categoryDelete',productController.categoryDelete)

//usermgt
router.get('/adminuser',userController.usermgt_get) 
router.get('/blockuser/:id',userController.blockuser)
router.get('/unblockuser/:id',userController.unblockuser)

//orderdetails
router.get('/adminOrder',userController.orderDetails)
router.get('/adminCancelorder/:id',userController.adminCancelorder)

//coupon
router.get('/adminCoupon',userController.couponGet)
router.post('/couponAdd/:id',userController.addCoupon)
router.post('/couponDelete',userController.deleteCoupon)




module.exports = router;