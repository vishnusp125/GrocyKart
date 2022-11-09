const mongoose = require('mongoose')


const bannerSchema = new mongoose.Schema ({
    name :{
        type:String,
        required : true
    }
},{timestamps:true})


const bannerModel = mongoose.model('banner', bannerSchema);

module.exports = bannerModel;
