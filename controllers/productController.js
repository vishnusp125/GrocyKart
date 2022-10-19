const { json } = require('express')
const Product = require('../models/product')




module.exports.addproductform_get = (req, res) => {
    res.render('admin/admin-addproduct.ejs', { layout: 'layout/admin-layout.ejs', admin: true })
}



//add product

module.exports.addproduct_post = async (req, res) => {
    try {
        const product = await Product.create(req.body)
        console.log(product);
        res.redirect('/adminproduct')
    }
    catch (err) {
        console.log(err);

    }

}


//get product

module.exports.viewproduct_get = async (req, res) => {

    try {
        const products = await Product.find({});
        console.log(products);
        res.render('admin/viewproduct', { product: products, layout: 'layout/admin-layout', admin: true })


    } catch (err) {
        console.log(err);

    }
}


//delete

module.exports.productdelete_get = async (req, res) => {
    try {
        const prodId = req.params.id
        console.log(211);
        await Product.deleteOne({ _id: prodId })
        res.redirect('/viewproduct')

        console.log(prodId);

    } catch (err) {
        console.log(err);
    }

}


//edit product

module.exports.editproduct_get = async (req, res) => {

    try {
        // console.log('in edit product form');
        const prodId = req.params.id
        const products = await Product.findById(prodId)
        // console.log(products);
        res.render('admin/editproduct', { products, layout: 'layout/admin-layout', admin: true })

    } catch (err) {
        console.log(err.message);
    }

}

module.exports.editproduct_post = async (req, res) => {
    const prodId = req.params.id
    // console.log(prodId);


    try {
        await Product.updateOne({ _id: prodId }, {
            $set: {
                name: req.body.name,
                category: req.body.category,
                price: req.body.price,
                description: req.body.description,
                stock: req.body.stock,
                image: req.body.image
            }

        })
        res.redirect('/viewproduct')

    } catch (err) {
        console.log(err);

    }
}

