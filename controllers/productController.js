const { json } = require('express')
const Product = require('../models/product')
const Category = require('../models/category')
const fs = require('fs')
const { builtinModules } = require('module')

let validation = {
    category: false
}



module.exports.addproductform_get = (req, res) => {

    Category.find().then((category) => {
        res.render('admin/admin-addproduct.ejs', { result: ' ', category, layout: 'layout/admin-layout.ejs', admin: true })

    })


}


module.exports.addproduct_post = async (req, res) => {

    console.log(req.body);  
    const offr = req.body.price/100*req.body.offer  

    const name = req.body.name;
    const category = req.body.category;
    const price = req.body.price;
    // const bprice = req.body.bprice;
    const discountedPrice = req.body.price - offr;
    const description = req.body.description;
    const stock = req.body.stock;
    const offer = req.body.offer

    const product = await Product.create({ name, category, price,offer,discountedPrice, description, stock })
    console.log(product);
    try {

        console.log('in try block');
        let image = req.files.image;
        let image2 = req.files.image2;
        let image3 = req.files.image3;
        console.log('after let');
        image.mv('./public/image/' + product._id + ".jpeg")
        image2.mv('./public/image/' + product._id + "2.jpeg")
        image3.mv('./public/image/' + product._id + "3.jpeg")
        res.redirect('/adminproduct')

    } catch (err) {
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
    
    const offr = req.body.price/100*req.body.offer 

    try {
        await Product.updateOne({ _id: prodId }, {
            $set: {
                name: req.body.name,
                category: req.body.category,
                price: req.body.price,
                discountedPrice: req.body.price - offr,
                description: req.body.description,
                stock: req.body.stock,
                image: req.body.image,
                offer: req.body.offer
            }

        })
        res.redirect('/viewproduct')

    } catch (err) {
        console.log(err);

    }
}

//category mgt

module.exports.categoryMgt = (req, res) => {
    Category.find()
        .then((result) => {
            res.render('admin/category', { result, validation, layout: 'layout/admin-layout', admin: true })
            validation.category = false
        }).catch((err) => console.log(err))

}
module.exports.categoryMgtpost = async (req, res) => {

    newcat = req.body.category
    Category.findOne({ category: newcat })
        .then((result) => {
            if (result) {
                validation.category = true
                res.redirect('/categoryMgt')
            } else {
                let category = new Category({
                    category: newcat
                })
                category.save()
                    .then(() => {
                        res.redirect('/categoryMgt')
                    }).catch((err) => {
                        console.log(err)
                    })

            }
        })

}

module.exports.categoryDelete = (req, res) => {



    newcat = req.query.id
    // console.log(newcat)
    Category.deleteOne({ _id: newcat })
        .then((result) => {
            // console.log(result)
            res.redirect('/categoryMgt')
        }).catch((err) => {
            console.log(err)
        })
}





