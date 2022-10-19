const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/store', {
    useNewUrlParser: true,
    useUnifiedTopology: true

})

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    products: [
        {
            productId: { type: String, },
            quantity: {
                type: Number,
                default: 1,
            }
        }
    ],
    amount: {
        type: Number,
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    status: {
        default: "pending"
    }

})

module.exports = mongoose.model("order", orderSchema)
