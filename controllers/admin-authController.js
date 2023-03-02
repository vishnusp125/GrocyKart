const Admin = require('../models/admin')
const User = require('../models/user')
const Product = require('../models/product')
const jwt = require('jsonwebtoken')


const { adminhandleErrors } = require('../middleware/admin-errorhandling')
const { loginhandleErrors } = require('../middleware/admin-errorhandling')
const { find } = require('../models/admin')

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'secretforhashing2',
        {
            expiresIn: maxAge
        });
}

module.exports.adminsignup_get = (req, res) => {
    res.render('../views/admin/admin-signup.ejs', { layout: './layout/admin-layout.ejs', admin: false })
}

module.exports.adminlogin_get = (req, res) => {
    res.render('../views/admin/admin-signin.ejs', { layout: './layout/admin-layout.ejs', admin: false })
}

module.exports.adminsignup_post = async (req, res) => {
    const { adminname, password } = req.body;
    try {
        const admin = await Admin.create({ adminname, password })
        const token = createToken(admin._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ admin });
    }


    catch (errors) {
        console.log(errors)
        const errorHandler = adminhandleErrors(errors);
        res.status(400).json({ errorHandler })
    }
}
module.exports.adminsignin_post = async (req, res) => {
    const { adminname, password } = req.body;
    try {
        const admin = await Admin.login(adminname, password)
        const token = createToken(admin._id);
        res.cookie('jwt2', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ admin })

    }
    catch (errors) {
        const errorHandler = loginhandleErrors(errors);
        res.status(400).json({ errorHandler })
    }
}

module.exports.adminLogout_get = (req, res) => {
    res.cookie('jwt2', '', { maxAge: 1 })
    res.redirect('/admin');
}

module.exports.adminHome = async (req, res) => {

    const user = await User.count()
    const productCount = await Product.count()
    const product = await Product.find()


    let Sales = await Product.aggregate([{ $group: { _id: null, sum_val: { $sum: "$sales" } } }])
    let totalSales = (Sales[0].sum_val);

    const sales = [];
    const timeOfSale = [];

    let k = 0;
    let l = 0;
    let m = [];
    let n;

    await User.find({})
        .then((results) => {
            let sums;
            n = results.length;

            for (result of results) {
                k++;
                const orders = result.order
                m.push(orders.length);

                for (let order of orders) {
                    l++;
                    sums = m.reduce((partialSum, a) => partialSum + a, 0);
                    order = order.toJSON();

                    if (order.orderStatus !== "Order cancelled") {
                        sales.push(order.count * order.discountedPrice);
                        timeOfSale.push(order.createdAt.toISOString().substring(0, 10));
                    }
                }
                if (l === sums && k === n) {

                    const Productlist = Product.find({})
                        .then((result) => {
                            const sum = function (items, prop1, prop2) {
                                return items.reduce(function (a, b) {
                                    return parseInt(a) + (parseInt(b[prop1]) * parseInt(b[prop2]));
                                }, 0);
                            };

                            const total = sum(result, 'discountedPrice', 'sales');

                            res.render('admin/admin-index', { Productlist, productCount, result, total: total, sales, timeOfSale, totalSales, user, layout: './layout/admin-layout.ejs', admin: true })
                        }).catch((err) => {
                            console.log(err)
                        })
                }

            }

        })

}


