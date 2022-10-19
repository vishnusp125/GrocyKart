const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/store', {
  useNewUrlParser: true,
  useUnifiedTopology: true

})

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    // ref: "Category",
  },
  image: {
    type: String,
    required: true,
  },

  stock: {
    type: String,
    required: true,
  },
});

const productModel = mongoose.model('product', productSchema);
module.exports = productModel;
