const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/store', {
    useNewUrlParser: true,
    useUnifiedTopology: true

})

const categorySchema = new mongoose.Schema ({
    category :{
        type:String,
        required : true
    }
},{timestamps:true})


const categoryModel = mongoose.model('category', categorySchema);

module.exports = categoryModel;
