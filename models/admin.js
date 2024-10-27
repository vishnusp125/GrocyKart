const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


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
}, { timestamps: true })

// fire a function before doc saved to db

adminSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next();

});

// static method to login admin

adminSchema.statics.login = async function (adminname, password) {
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