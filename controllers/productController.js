const { json } = require('express')
const Product = require('../models/product')
const Category = require('../models/category')
const fs = require('fs')
const { builtinModules } = require('module')





module.exports.addproductform_get = (req, res) => {

    Category.find().then((category) => {
        res.render('admin/admin-addproduct.ejs', {result:' ',category,layout: 'layout/admin-layout.ejs', admin: true })
      
        })
   
   
}




module.exports.addproduct_post = async (req, res) => {
    
    console.log(req.body);
    const name = req.body.name;
    const category = req.body.category;
    const price = req.body.price;
    const bprice = req.body.bprice;
    const description = req.body.description;
    const stock = req.body.stock;

    const product = await Product.create({name,category,price,bprice,description,stock})
    console.log(product);
    try {

        console.log('in try block');
        let image = req.files.image;
        image.mv('./public/image/' + product._id + ".jpeg")
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

//category mgt

module.exports.categoryMgt = (req,res)=>{
    Category.find()
    .then((result)=>{
    res.render('admin/category',{result, layout: 'layout/admin-layout', admin: true })
    }).catch((err)=>console.log(err))

}
module.exports.categoryMgtpost = async (req,res)=> {

    try{
        let category = req.body.category

        const cat = await Category.create({category})
        res.redirect('/categoryMgt')

    } catch (err){
        console.log(err);
    }
}

    module.exports.categoryDelete = (req,res) => {

    
      
        newcat = req.query.id
        // console.log(newcat)
        Category.deleteOne({_id:newcat})
        .then((result)=>{
            // console.log(result)
            res.redirect('/categoryMgt')
        }).catch((err)=>{
            console.log(err)
        })
    }
    




