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
    await Users.findByIdAndUpdate({ _id: userId }, { isBlocked: false })
    res.redirect('/adminuser')
}

module.exports.unblockuser = async (req, res) => {
    const userId = req.params.id
    await Users.findByIdAndUpdate({ _id: userId }, { isBlocked: true })
    res.redirect('/adminuser')
}

module.exports.orderDetails = async (req, res) => {
    const result = await Users.find({})
    let username = result[0].username
    let orders = []
    for (item of result) {
        orders = orders.concat(item.order)
    }
    orders.sort((a, b) => {
        return b.createdAt - a.createdAt;
    });
    res.render('admin/orderDetails', { orders, layout: './layout/admin-layout', admin: true })
}


module.exports.adminCancelorder = (req, res) => {
    const user = req.user.id
    uniqueid = req.params.id
    if (user) {
        Users.findOne({ user: uniqueid })
            .then((result) => {
                const orders = result.order
                for (let order of orders) {
                    order = order.toJSON();
                    if (order.unique === uniqueid) {
                        Promise.all([(Users.updateOne({ "_id": user, "order.unique": uniqueid }, { $set: { "order.$.orderStatus": "Order cancelled" } })), (Product.updateOne({ "_id": order._id }, { $inc: { "stock": order.count } }))])
                            .then((result) => {
                                res.redirect('/adminOrder')
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    }
                }

            })
    }
}

module.exports.adminStatus = (req, res) => {
    const user = req.user.id
    uniqueid = req.params.id
    Users.findOne({ _id: user })
        .then((result) => {
            const user = result._id
            const orders = result.order
            if (req.body.status == 'Delivered') {
                for (let order of orders) {
                    order = order.toJSON();
                    if (order.unique === uniqueid) {
                        Promise.all([(Users.updateOne({ "_id": user, "order.unique": uniqueid }, { $set: { "order.$.orderStatus": "Delivered" } }))])
                            .then((result) => {
                                res.redirect('/adminOrder')
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    }
                }
            } else if (req.body.status == 'Dispatched') {
                for (let order of orders) {
                    order = order.toJSON();
                    if (order.unique === uniqueid) {

                        Promise.all([(Users.updateOne({ "_id": user, "order.unique": uniqueid }, { $set: { "order.$.orderStatus": "Dispatched" } }))])
                            .then((result) => {
                                res.redirect('/adminOrder')
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    }
                }

            } else if (req.body.status == 'Cancelled') {
                for (let order of orders) {
                    order = order.toJSON();
                    if (order.unique === uniqueid) {
                        Promise.all([(Users.updateOne({ "_id": user, "order.unique": uniqueid }, { $set: { "order.$.orderStatus": "Order cancelled" } })), (Product.updateOne({ "_id": order._id }, { $inc: { "stock": order.count, "sales": (order.count * -1) } }))])
                            .then((result) => {
                                res.redirect('/adminOrder')
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    }
                }
            }
        })
}

module.exports.couponGet = (req, res) => {
    Coupon.find()
        .then((coupon) => {
            res.render('admin/coupon', { coupon, layout: './layout/admin-layout', admin: true })
        })
}

module.exports.addCoupon = (req, res) => {
    Coupon.findOne({ couponCode: req.body.coupencode })
        .then(() => {
            let coupon = new Coupon({
                couponCode: req.body.couponcode,
                couponValue: req.body.couponvalue,
                minBill: req.body.minbill,
                couponExpiry: req.body.expirydate
            })
            coupon.save()
                .then(() => {
                    res.redirect('back')
                })
        })
}

module.exports.deleteCoupon = (req, res) => {
    const coupon = req.query.id
    Coupon.deleteOne({ couponCode: coupon })
        .then(() => {
            res.redirect('/adminCoupon')
        })
}













