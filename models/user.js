const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { isEmail } = require('validator')

mongoose.connect('mongodb://0.0.0.0:27017/store', {
    useNewUrlParser: true,
    useUnifiedTopology: true

})

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
    }
})

// fire a function before doc saved to db

userSchema.pre('save', async function (next) {
    // console.log('user about to be created and saved',this);
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


