const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/store', {
    useNewUrlParser: true,
    useUnifiedTopology: true

})

const cartSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    products: [
        {
            productId: {
                type: String,
            },
            quantity: {
                type: Number,
                default: 1,
            }
        }
    ]

})

module.exports = mongoose.model("cart", cartSchema)
