const mongoose = require('mongoose')
const Product = require('./product')
const bcrypt = require('bcrypt')
const { isEmail } = require('validator')


const cartSchema = new mongoose.Schema({
    name: {type: String},
    discountedPrice: {type: Number},
    description: {type: String},
    category: {type: String},
    image: {type: String},
    stock: {type: Number},
    count:{type:Number},
    total:{type:Number}
},{timestamps:true})

const wishlistSchema = new mongoose.Schema({
    name: {type: String},
    discountedPrice: {type: Number},
    description: {type: String},
    category: {type: String},
    image: {type: String},
    stock: {type: Number},
    count:{type:Number}
},{timestamps:true})

const addressSchema = new mongoose.Schema({
        username : {type:String},
        email:{type:String},
        phoneNo : {type:Number},
        address: {type:String},
        city : {type:String},
        state : {type:String},
        country:{type:String},
        zip :{type:String}

},{timestamps:true})

const orderSchema = new mongoose.Schema({
    name: {type: String},
    price: {type: Number},
    discountedPrice:{type:Number},
    description: {type: String},
    category: {type: String},
    image: {type: String},
    stock: {type: Number},
    count:{type:Number},
    offer:{type:String},
    paymentOption:{type:String},
    address:{type:String},
    zip:{type:Number},
    state:{type:String},
    country:{type:String},
    unique:{type:String},
    orderStatus:{type:String, default:'Under Process'}
},{timestamps:true})

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter the username'],
        unique: true,
        minlength: [4, 'Username must be minimum 4 char']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [4, "password must be minimum 4 char"]

    },
    email: {
        type: String,
        unique: [true, "That email is already registered"],
        required: [true, 'Please enter an email'],
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']

    },
    phoneNo: {
        type: String,
        // unique:true,
        required: [true, 'Please enter the phone number'],
        minlength: [10, 'Please enter 10 digit phone number'],

    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    address:{
        type:[addressSchema],
        default:[]
        
    },
    profileImage : {
        type : String,
        default : 'null'
    },
    isVerified: {
        type: Boolean,
        default:false
    },
    cart:{
        type: [cartSchema],
        default:[]
    },
    wishlist:{
        type: [wishlistSchema],
        default:[]

    },
    order:{
        type: [orderSchema],
        default:[]

    }  
},{timestamps:true})


// fire a function before doc saved to db

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next();
 
});



// static method to login user

userSchema.statics.login = async function (username, password) {
    const user = await this.findOne({ username });

    if (user) {
        const auth = await bcrypt.compare(password, user.password)
        if (auth) {
            if(user.isBlocked == false){
            return user;
            }
            throw Error('Your account is blocked')
        }
        throw Error('Incorrect Password')

    }
    throw Error('Incorrect username')

}


const userModel = mongoose.model('user', userSchema);

module.exports = userModel;


