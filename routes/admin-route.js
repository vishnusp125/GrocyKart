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
        {
            expiresIn: maxAge
        });
}

//admin sigup get and post
router.get('/adminsignup', adminauthController.adminsignup_get)
router.get('/admin',adminauthController.adminlogin_get)
router.post('/adminsignup', adminauthController.adminsignup_post)
router.post('/adminsignin', adminauthController.adminsignin_post)
router.get('/adminLogout', adminauthController.adminLogout_get)
router.get('/admindash', adminAuthmiddleware.requireAuth,adminauthController.adminHome)

//productmgt
router.get('/adminproduct',adminAuthmiddleware.requireAuth, productController.addproductform_get)
router.post('/adminproduct',adminAuthmiddleware.requireAuth, productController.addproduct_post)
router.get('/viewproduct',adminAuthmiddleware.requireAuth, productController.viewproduct_get)
router.get('/deleteproduct/:id',adminAuthmiddleware.requireAuth, productController.productdelete_get)
router.get('/admineditproduct/:id',adminAuthmiddleware.requireAuth, productController.editproduct_get)
router.post('/admineditproduct/:id',adminAuthmiddleware.requireAuth, productController.editproduct_post)

//category
router.get('/categoryMgt',adminAuthmiddleware.requireAuth, productController.categoryMgt)
router.post('/categoryMgtpost',adminAuthmiddleware.requireAuth, productController.categoryMgtpost)
router.post('/categoryDelete', adminAuthmiddleware.requireAuth,productController.categoryDelete)

//usermgt
router.get('/adminuser',adminAuthmiddleware.requireAuth, userController.usermgt_get)
router.get('/blockuser/:id',adminAuthmiddleware.requireAuth, userController.blockuser)
router.get('/unblockuser/:id',adminAuthmiddleware.requireAuth, userController.unblockuser)

//orderdetails
router.get('/adminOrder',adminAuthmiddleware.requireAuth, userController.orderDetails)
router.get('/adminCancelorder/:id',adminAuthmiddleware.requireAuth, userController.adminCancelorder)
router.post('/adminStatus/:id',adminAuthmiddleware.requireAuth, userController.adminStatus)

//coupon
router.get('/adminCoupon',adminAuthmiddleware.requireAuth, userController.couponGet)
router.post('/couponAdd/:id',adminAuthmiddleware.requireAuth, userController.addCoupon)
router.post('/couponDelete',adminAuthmiddleware.requireAuth, userController.deleteCoupon)

//banner
router.get('/adminBanner',adminAuthmiddleware.requireAuth, productController.bannerGet)
router.post('/adminBanner',adminAuthmiddleware.requireAuth, productController.bannerPost)
router.post('/bannerDelete',adminAuthmiddleware.requireAuth, productController.bannerDelete)






module.exports = router;