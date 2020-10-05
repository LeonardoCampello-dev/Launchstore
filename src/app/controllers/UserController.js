const { unlinkSync } = require('fs')
const { hash } = require('bcryptjs')

const User = require('../models/User')
const Product = require('../models/Product')

const { formatCpfCnpj, formatCep } = require('../../lib/utils')

module.exports = {
    create(req, res) {
        return res.render('users/register.njk')
    },
    async post(req, res) {
        try {
            let {
                name,
                email,
                password,
                cpf_cnpj,
                cep,
                address
            } = req.body

            password = await hash(password, 8)
            cpf_cnpj = cpf_cnpj.replace(/\D/g, '')
            cep = cep.replace(/\D/g, '')

            const userId = await User.create({
                name,
                email,
                password,
                cpf_cnpj,
                cep,
                address
            })

            req.session.userId = userId

            return res.redirect('/users')
        } catch (error) {
            console.error(error)
            return res.render('users/register.njk', {
                error: 'Erro na criação de conta!'
            })
        }
    },
    async show(req, res) {
        try {
            const { user } = req

            user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj)
            user.cep = formatCep(user.cep)

            return res.render('users/index.njk', { user })
        } catch (error) {
            console.error(error)
        }
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
    },
    async delete(req, res) {
        try {
            const products = await Product.findAll({ where: { user_id: req.body.id } })

            const allFilesPromises = products.map(product =>
                Product.files(product.id))

            let promiseResults = await Promise.all(allFilesPromises)

            promiseResults.map(files => {
                files.map(file => {
                    try {
                        unlinkSync(file.path)
                    } catch (error) {
                        console.error(error)
                    }
                })
            })

            await User.delete(req.body.id)
            req.session.destroy()

            return res.render('session/login.njk', {
                success: 'Conta deletada com sucesso! ✅'
            })
        } catch (error) {
            console.error(error)
            return res.render('users/index.njk', {
                user: req.body,
                error: 'Erro ao tentar deletar conta!'
            })
        }
    }
}