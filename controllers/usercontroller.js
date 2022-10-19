const Users = require('../models/user')

module.exports.usermgt_get = async (req, res) => {

    try {
        const users = await Users.find({})
        res.render('admin/admin-usermgt', { user: users, layout: './layout/admin-layout.ejs', admin: true })
    } catch (err) {
        console.log(err);
    }
}

module.exports.blockuser = async (req, res) => {
    const userId = req.params.id
    const user = await Users.findByIdAndUpdate({ _id: userId }, { isBlocked: false })
    res.redirect('/adminuser')

}

module.exports.unblockuser = async (req, res) => {
    const userId = req.params.id
    const user = await Users.findByIdAndUpdate({ _id: userId }, { isBlocked: true })
    res.redirect('/adminuser')

}

