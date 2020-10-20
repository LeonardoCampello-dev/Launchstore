const LoadProductServices = require('../services/LoadProductServices')

const Cart = require('../../lib/cart')

module.exports = {
    async index(req, res) {
        try {
            let cart = req.session

            const product = await LoadProductServices.load('product', {
                where: { id: 1 }
            })

            cart = Cart.init().addOne(product)

            return res.render('cart/index.njk', { cart })
        } catch (error) {
            console.error(error)
        }
    }
}