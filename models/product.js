const mongoose = require('mongoose')

// mongoose.connect('mongodb://0.0.0.0:27017/store', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true

// })

const productSchema =  mongoose.Schema({
  name: {
    type: String,
    required: [true,'Please add all product details']
  },
  price: {
    type: Number,
    required: true
  },
  bprice:{
    type:Number,
    required:true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required:true
  },
  image: {
    type: String,
  },

  stock: {
    type: Number,
    required: true
  },
  offer:{
    type:String
  },
  sales:{
    type:Number,
    default:0
  },
},{timestamps:true});

const productModel = mongoose.model('product', productSchema);
module.exports = productModel;
