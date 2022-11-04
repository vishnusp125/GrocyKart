const Admin = require('../models/admin')
const User = require('../models/user')
const Product = require('../models/product')
const jwt = require('jsonwebtoken')


const { adminhandleErrors } = require('../middleware/admin-errorhandling')
const { loginhandleErrors } = require('../middleware/admin-errorhandling')
const { find } = require('../models/admin')

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'secretforhashing',
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
    console.log('in admin signup page');
    const { adminname, password } = req.body;
    console.log(req.body);


    try {
        const admin = await Admin.create({ adminname, password })
        console.log(req.body);
        console.log(admin);
        console.log('saving on db');
        const token = createToken(admin._id);
        console.log('token passed');
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ admin });
    }


    catch (errors) {
        console.log(errors)
        console.log('in error handler');
        const errorHandler = adminhandleErrors(errors);
        console.log(errorHandler);
        res.status(400).json({ errorHandler })
        console.log('error in signup');
    }
}
module.exports.adminsignin_post = async (req, res) => {

    console.log('in admin signin page');

    const { adminname, password } = req.body;
    console.log(req.body);

    try {
        const admin = await Admin.login(adminname, password)
        console.log(req.body);
        console.log('in try');
        const token = createToken(admin._id);
        console.log('token passed');
        res.cookie('jwt2', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ admin })

    }
    catch (errors) {

        const errorHandler = loginhandleErrors(errors);
        console.log(errorHandler);
        res.status(400).json({ errorHandler })
        console.log('error in signin');
    }

}

module.exports.adminLogout_get = (req, res) => {
    res.cookie('jwt2', '', { maxAge: 1 })
    res.redirect('/adminsignin');
}

module.exports.adminHome = async (req, res) => {

    const user = await User.count()
    const productCount = await Product.count()
    // const product = await Product.find()


    let Sales = await Product.aggregate([{ $group: { _id: null, sum_val: { $sum: "$sales" } } }])
    let totalSales = (Sales[0].sum_val);
    //  console.log(totalSales);

    const sales = [];
    const timeOfSale = [];
    let k = 0;
    let l = 0;
    let m = [];
    let n;

    await User.find({})
        .then((results) => {
            // console.log(result)
            let sums;
            n = results.length;
            console.log(`n:${n}`);

            for (result of results) {
                k++;
                console.log(`k:${k}`);
                const orders = result.order
                m.push(orders.length);
                console.log(`m:${m}`);

                console.log(`sums:${sums}`)

                for (let order of orders) {
                 l++;
                 console.log(`l:${l}`);
                 sums = m.reduce((partialSum, a) => partialSum + a, 0);
                 order = order.toJSON();

                if (order.orderStatus !== "Order cancelled") {
                console.log(order.count);
                console.log(order.price);
                sales.push(order.count * order.price);
                console.log(sales);
                timeOfSale.push(order.createdAt.toISOString().substring(0, 10));
                console.log(timeOfSale);
                     }
                }
                if (l === sums && k === n) {

                        console.log(sales);
                        console.log(typeof (sales[0]));

                        console.log(timeOfSale);
                        console.log(typeof (timeOfSale[0]));
                        Product.find({})
                            .then((result) => {
                                const sum = function (items, prop1, prop2) {
                                    return items.reduce(function (a, b) {
                                        return parseInt(a) + (parseInt(b[prop1]) * parseInt(b[prop2]));
                                    }, 0);
                                };
                            
                                const total = sum(result, 'price', 'sales');
                                console.log(total);
                              
                                res.render('admin/admin-index', {productCount,result, total: total, sales, timeOfSale, totalSales, user, layout: './layout/admin-layout.ejs', admin: true })
                            }).catch((err) => {
                                console.log(err)
                            })
                }

            }

            })


    // res.render('admin/admin-index', { totalSales, user, layout: './layout/admin-layout.ejs', admin: true })
}


