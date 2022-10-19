const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


mongoose.connect('mongodb://0.0.0.0:27017/store', {
    useNewUrlParser: true,
    useUnifiedTopology: true,


})

const adminSchema = mongoose.Schema({
    adminname: {
        type: String,
        unique: true,
        required: [true, 'Please enter the username'],
        minlength: [4, 'Username must be minimum 4 char']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [4, "password must be minimum 4 char"]

    }
})

// fire a function before doc saved to db

adminSchema.pre('save', async function (next) {
    // console.log('user about to be created and saved',this);
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next();

});

// static method to login admin

adminSchema.statics.login = async function (adminname, password) {
    console.log('in admin db');
    const admin = await this.findOne({ adminname });

    if (admin) {
        const auth = await bcrypt.compare(password, admin.password)
        if (auth) {
            return admin;
        }
        throw Error('Incorrect Password')

    }
    throw Error('Incorrect username')

}

const adminModel = mongoose.model('admin', adminSchema);
module.exports = adminModel;