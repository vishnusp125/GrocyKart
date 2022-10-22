const mongoose = require('mongoose')

module.exports = {
    connectToDb:(cb)=>{
        mongoose.connect(process.env.MONGO_URI)
        .then(()=>{console.log('connected to db')
        return (cb)
        
    })
    .catch((err)=>{
        console.log(err)
        return cb(err)
    })
}
}