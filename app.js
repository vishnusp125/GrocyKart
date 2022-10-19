const express = require('express')
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user-route')
const adminRoutes = require('./routes/admin-route')
const cookieParser = require('cookie-parser')
// const { requireAuth, checkUser } = require('./middleware/authMiddleware')
const nocache = require('nocache')
const fileUpload = require('express-fileupload')



app.set('view engine', 'ejs')
app.set('layout', './layout/layout.ejs', './layout/admin-layout.ejs')

app.use(express.static('public'))
app.use(expressLayouts)
app.use(nocache())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.json())
// app.use('*',checkUser)
app.use('/', userRoutes);
app.use('/', adminRoutes);

app.use(fileUpload())


app.use(function (req, res, next) {
    res.status(404).send("<h1>Page not Found...</h1>")
    next()
})

app.listen(3000, () => {
    console.log('Server started at port 3000');
})





