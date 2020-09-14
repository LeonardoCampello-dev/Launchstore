const User = require("../models/User")

module.exports = {
    create(req, res) {
        return res.render('users/register.njk')
    },
    async post(req, res) {
        const userId = await User.create(req.body)

        req.session.userId = userId

        return res.redirect('/users')
    },
    show(req, res) {
        return res.send('Usuário cadastrado!')
    }
}