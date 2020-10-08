const LoadProductServices = require('../services/LoadProductServices')
const User = require('../models/User')

const mailer = require('../../lib/mailer')
const { formatCpfCnpj, formatCep } = require('../../lib/utils')

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
    async post(req, res) {
        try {
            const product = await LoadProductServices.load('product', {
                where: {
                    id: req.body.id
                }
            })

            const seller = await User.findOne({ where: { id: product.user_id } })
            const buyer = await User.findOne({ where: { id: req.session.userId } })

            await mailer.sendMail({
                from: 'no-reply@launchstore.com.br',
                to: seller.email,
                subject: 'Novo pedido de compra! 🛒',
                html: email(product, seller, buyer)
            })

            return res.render('orders/success.njk')
        } catch (error) {
            console.error(error)
            return res.render('orders/error.njk')
        }
    }
}