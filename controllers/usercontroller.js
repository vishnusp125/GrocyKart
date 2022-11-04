const Users = require('../models/user')
const Product = require("../models/product")
const Coupon = require('../models/coupon')

module.exports.usermgt_get = async (req, res) => {

    try {
        const users = await Users.find({})
        res.render('admin/admin-usermgt', { user: users, layout: './layout/admin-layout.ejs', admin: true })
    } catch (err) {
        console.log(err);
    }
}

module.exports.blockuser = async (req, res) => {
    const userId = req.params.id
    const user = await Users.findByIdAndUpdate({ _id: userId }, { isBlocked: false })
    res.redirect('/adminuser')

}

module.exports.unblockuser = async (req, res) => {
    const userId = req.params.id
    const user = await Users.findByIdAndUpdate({ _id: userId }, { isBlocked: true })
    res.redirect('/adminuser')

}

module.exports.orderDetails = async (req, res) => {


    // adminSession = req.session;
    // if (adminSession.adminId) {
        const result = await Users.find({})
        let username = result[0].username

        // console.log(result)
        let orders = []
        for (item of result) {
            orders = orders.concat(item.order)
        }
        // console.log(orders);
        // result = result.order.reverse()
        orders.sort((a, b) => {
            return b.createdAt - a.createdAt;
        });
        // console.log(result)
        console.log(orders);   
        
     

        let name = username
        // console.log(name);


    
        // const limit = 10
        // const pages = Math.ceil(orders.length / limit)
        // console.log(orders.length)
        // console.log(orders.length / limit)
        // console.log(pages)
        // const page = {}
        // page.page = req.params.page
        // if (page.page > 1) {
        //     page.previous = parseInt(page.page) - 1
        // } else {
        //     page.previous = false
        // }
        // if (page.page < pages) {
        //     page.next = parseInt(page.page) + 1
        // }
    

    res.render('admin/orderDetails', {orders, layout: './layout/admin-layout', admin: true })

}


module.exports.adminCancelorder =  (req, res) => {

    const user = req.user.id
    // console.log(user);
  

    uniqueid = req.params.id
    // console.log(uniqueid);
    if (user) {
        Users.findOne({user:uniqueid})
        .then((result) =>{
            // console.log(result);

            const orders = result.order

            // console.log(orders);  

                    for (let order of orders) {
                    order = order.toJSON();
                    if (order.unique === uniqueid) {
                        Promise.all([(Users.updateOne({ "_id":user, "order.unique": uniqueid }, { $set: { "order.$.orderStatus": "Order cancelled" } })), (Product.updateOne({ "_id": order._id }, { $inc: { "stock": order.count } }))])
                            .then((result) => {
                                res.redirect('/adminOrder')
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

module.exports.couponGet =  (req, res) => {

    Coupon.find()
    .then((coupon)=>{

    res.render('admin/coupon', {coupon, layout: './layout/admin-layout', admin: true })

})


}

module.exports.addCoupon =  (req, res) => {

    Coupon.findOne({ couponCode:req.body.coupencode})
    .then(()=>{
        let coupon = new Coupon({
            couponCode:req.body.couponcode,
            couponValue:req.body.couponvalue,
            minBill:req.body.minbill,
            couponExpiry:req.body.expirydate 
        })
        coupon.save()
        .then(()=>{
            res.redirect('back')
        })
    })
}

module.exports.deleteCoupon =  (req, res) => {

const coupon = req.query.id
console.log(coupon);
Coupon.deleteOne({ couponCode:coupon })
.then(()=>{
    res.redirect('/adminCoupon')
})

}













