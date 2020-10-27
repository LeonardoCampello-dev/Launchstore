const LoadProductServices = require('../services/LoadProductServices')
const User = require('../models/User')
const Order = require('../models/Order')

const mailer = require('../../lib/mailer')
const Cart = require('../../lib/cart')
const { formatCpfCnpj, formatCep, formatPrice, date } = require('../../lib/utils')

const email = (product, seller, buyer) => `
<h2>Olá ${seller.name} 😁</h2>
<p>Você tem um novo pedido de compra!</p>
<p>Produto: ${product.name}</p>
<p>Preço: ${product.formattedPrice} 💰</p>
<p><br/><br/></p>

<h3>Dados do comprador ✅</h3>

<p>${buyer.name}</p>
<p>${buyer.cpf_cnpj = formatCpfCnpj(buyer.cpf_cnpj)}<br/></p>
<p>${buyer.email} 📧</p>
<p>${buyer.address}, ${buyer.cep = formatCep(buyer.cep)} 📍</p>
<p><br/><br/></p>

<p><strong>Entre em contato com o comprador para finalizar a venda! 📱</strong></p>
<p><br/></p>

<p>Atenciosamente, Equipe Launchstore. 🧡</p>
`

module.exports = {
    async index(req, res) {
        try {
            let orders = await Order.findAll({
                where: { buyer_id: req.session.userId }
            })

            const getOrdersPromises = orders.map(async order => {

                order.products = await LoadProductServices.load('products', {
                    where: { id: order.product_id }
                })

                order.buyer = await User.findOne({
                    where: { id: order.buyer_id }
                })

                order.seller = await User.findOne({
                    where: { id: order.seller_id }
                })

                order.formattedPrice = formatPrice(order.price)
                order.formattedTotal = formatPrice(order.total)

                const statusTypes = {
                    open: 'Aberto',
                    sold: 'Vendido',
                    canceled: 'Cancelado'
                }

                order.formattedStatus = statusTypes[order.status]

                const updatedAt = date(order.updated_at)

                order.formattedUpdatedAt = `${order.formattedStatus} em ${updatedAt.day}/${updatedAt.month}/${updatedAt.year} às ${updatedAt.hours}h${updatedAt.minutes}`

                return order
            })

            orders = await Promise.all(getOrdersPromises)

            return res.render('orders/index.njk', { orders })
        } catch (error) {
            console.error(error)
        }
    },
    async post(req, res) {
        try {
            const cart = Cart.init(req.session.cart)

            const buyer_id = req.session.userId

            const filteredItems = cart.items.filter(item => item.product.user_id != buyer_id)

            const createOrdersPromises = filteredItems.map(async item => {
                let { product, price: total, quantity } = item
                const { price, id: product_id, user_id: seller_id } = product
                const status = 'open'

                const order = await Order.create({
                    seller_id,
                    buyer_id,
                    product_id,
                    price,
                    quantity,
                    total,
                    status
                })

                product = await LoadProductServices.load('product', {
                    where: { id: product_id }
                })

                const seller = await User.findOne({ where: { id: seller_id } })

                const buyer = await User.findOne({ where: { id: buyer_id } })

                await mailer.sendMail({
                    from: 'no-reply@launchstore.com.br',
                    to: seller.email,
                    subject: 'Novo pedido de compra! 🛒',
                    html: email(product, seller, buyer)
                })

                return order
            })

            await Promise.all(createOrdersPromises)

            delete req.session.cart
            Cart.init()

            return res.render('orders/success.njk')
        } catch (error) {
            console.error(error)
            return res.render('orders/error.njk')
        }
    }
}
