
const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/store', {
    useNewUrlParser: true,
    useUnifiedTopology: true



})


const couponSchema = new mongoose.Schema({
    couponCode:{
        type : String,   
        trim : true,
        required : true,
    },
    couponValue :{
        type : Number,
        trim : true
    },
    minBill :{
        type : Number,
        trim : true
    },
    couponExpiry :{
        type : Date,
        trim : true
    },
    users : [{
        type : String,
        trim : true
    }],
    status: {
        type : String,
        default:'Active'
    }  
}, {timestamps: true})

// model to access schema
const couponModel = mongoose.model('coupon', couponSchema)
module.exports = couponModel;

