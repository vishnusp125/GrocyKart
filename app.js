const express = require('express')
const app = express();
const expressLayouts = require('express-ejs-layouts');
const userRoutes = require('./routes/user-route')
const adminRoutes = require('./routes/admin-route')
const cookieParser = require('cookie-parser')
const nocache = require('nocache')
const { requireAuth, checkUser } = require('./middleware/authMiddleware')
const fileUpload = require('express-fileupload')
const db = require('./database/connection')
const logger = require("morgan")


app.set('view engine', 'ejs')
app.set('layout', './layout/layout.ejs', './layout/admin-layout.ejs')

app.use(express.static('public'))
app.use(expressLayouts)
app.use(nocache())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.json())
app.use(fileUpload())
app.use('*',checkUser)
app.use('/', userRoutes);
app.use('/', adminRoutes);
app.use(logger('dev'))

db.connectToDb((err)=>{
    if(!err){
        app.listen(PORT,()=>{

        })
    }
})

app.use(function (req, res, next) {
    res.render('./users/404',{layout:false})
    next()
})

app.listen(3000, () => {
    console.log('Server started at port 3000');
})





