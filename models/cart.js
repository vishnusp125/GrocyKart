// const mongoose = require('mongoose')

// mongoose.connect('mongodb://0.0.0.0:27017/store', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true

// })

// const cartSchema = new mongoose.Schema ({

//     owner : {
//         type:String,
//         required:true
//     },
//     items: [{
//         itemId:{
//             type: ObjectID,
//             required:true
//         },
//     productName :{
//         type:String,
//         required:true
//     },
//     quantity :{
//         type:String,
//         required:true,
//         min : 1,
//         default : 1
//     },
   
//     price : {
//         type: Number
//     },

//     category :{
//         type:String,
//         required:true
//     },
  
//     image1 :{
//         type:String,
//         required:true
//     },
//      orderStatus : {
//         type : String,
//         default:"none"
//     },
   
// }],

//     bill:{
//         type:Number,
//         required:true,
//         default:0
//     },
   
//     cart : {
//         type : Boolean
//     }

// },{timestamps:true})

// const cartModel = mongoose.model('cart',cartSchema);
// module.exports = cartModel;
