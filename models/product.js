const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/store', {
  useNewUrlParser: true,
  useUnifiedTopology: true

})

const productSchema =  mongoose.Schema({
  name: {
    type: String,
    required: [true,'Please add all product details']
  },
  price: {
    type: String,
    required: true
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
    type: String,
    required: true
  },
});

const productModel = mongoose.model('product', productSchema);
module.exports = productModel;
