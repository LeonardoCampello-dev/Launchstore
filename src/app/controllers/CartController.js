const LoadProductServices = require('../services/LoadProductServices')

const Cart = require('../../lib/cart')

module.exports = {
    async index(req, res) {
        try {
            let { cart } = req.session

            cart = Cart.init(cart)

            return res.render('cart/index.njk', { cart })
        } catch (error) {
            console.error(error)
        }
    },
    async addOne(req, res) {
        const { id } = req.params

        const product = await LoadProductServices.load('product', {
            where: { id }
        })

        let { cart } = req.session

        cart = Cart.init(cart).addOne(product)

        req.session.cart = cart

        return res.redirect('/cart')
    },
    removeOne(req, res) {
        let { id } = req.params
        let { cart } = req.session

        if (!cart) return res.redirect('/cart')

        req.session.cart = Cart.init(cart).removeOne(id)

        return res.redirect('/cart')
    }
}