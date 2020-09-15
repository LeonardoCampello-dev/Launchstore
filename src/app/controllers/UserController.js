const User = require("../models/User")
const { formatCpfCnpj, formatCep } = require('../../lib/utils')

module.exports = {
    create(req, res) {
        return res.render('users/register.njk')
    },
    async post(req, res) {
        const userId = await User.create(req.body)

        req.session.userId = userId

        return res.redirect('/users')
    },
    async show(req, res) {
        const { user } = req

        user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj)
        user.cep = formatCep(user.cep)

        return res.render('users/index.njk', { user })
    },
    async put(req, res) {
        try {
            const { user } = req
            let { name, email, cpf_cnpj, cep, address } = req.body

            cpf_cnpj = cpf_cnpj.replace(/\D/g, '')
            cep = cep.replace(/\D/g, '')

            await User.update(user.id, {
                name,
                email,
                cpf_cnpj,
                cep,
                address
            })

            return res.render('users/index.njk', {
                user: req.body,
                success: 'Conta atualizada!'
            })
        } catch (error) {
            console.error(error)
            return res.render('users/index.njk', {
                error: 'Algo de errado aconteceu 😟'
            })
        }
    }
}