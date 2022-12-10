const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add all product details']
  },
  price: {
    type: Number,
    required: true
  },
  discountedPrice: {
    type: Number
  },
  offer: {
    type: Number
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },

  stock: {
    type: Number,
    required: true
  },
  sales: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

const productModel = mongoose.model('product', productSchema);
module.exports = productModel;
