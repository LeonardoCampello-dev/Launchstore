const { date, formatPrice } = require('../../lib/utils')

const Category = require('../models/Category')
const Product = require('../models/Product')
const File = require('../models/File')

module.exports = {
    async create(req, res) {
        const categories = await Category.all()

        return res.render('products/create.njk', { categories })
    },
    async post(req, res) {
        const keys = Object.keys(req.body)

        for (key of keys) {
            if (req.body[key] == ' && key != removed_files') {
                return res.send('Por favor, preencha todos os campos!')
            }
        }

        if (req.files.length == 0) res.send('Por favor, insira pelo menos uma imagem')

        let productId = await Product.create(req.body)

        const filesPromises = req.files.map(file => File.create({ ...file, product_id: productId }))
        await Promise.all(filesPromises)

        return res.redirect(`products/${productId}/edit`)
    },
    async show(req, res) {
        let product = await Product.find(req.params.id)

        if (!product) return res.send('Produto não encontrado!')

        const { minutes, hours, day, month } = date(product.updated_at)

        product.published = {
            date: `${day}/${month}`,
            time: `${hours}h${minutes}`
        }

        product.oldPrice = formatPrice(product.old_price)
        product.price = formatPrice(product.price)

        let files = await Product.files(product.id)
        files = files.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
        }))

        return res.render('products/show.njk', { product, files })
    },
    async edit(req, res) {
        let product = await Product.find(req.params.id)

        if (!product) return res.send('Produto não encontrado!')

        product.old_price = formatPrice(product.old_price)
        product.price = formatPrice(product.price)

        const categories = await Category.all()

        let files = await Product.files(product.id)
        files = files.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
        }))

        return res.render('products/edit.njk', { product, categories, files })
    },
    async put(req, res) {
        const keys = Object.keys(req.body)

        for (key of keys) {
            if (req.body[key] == ' && key != removed_files') {
                return res.send('Por favor, preencha todos os campos!')
            }
        }

        if (req.files.length != 0) {
            const newFilesPromises = req.files.map(file =>
                File.create({ ...file, product_id: req.body.id }))

            await Promise.all(newFilesPromises)
        }

        if (req.body.removed_files) {
            const removed_files = req.body.removed_files.split(',')
            const lastIndex = removed_files.length - 1

            removed_files.splice(lastIndex, 1)

            const removedFilesPromise = removed_files.map(id => File.delete(id))

            await Promise.all(removedFilesPromise)
        }

        req.body.price = req.body.price.replace(/\D/g, '')

        if (req.body.old_price != req.body.price) {
            const oldProduct = await Product.find(req.body.id)

            req.body.old_price = oldProduct.rows[0].price
        }

        await Product.update(req.body)

        return res.redirect(`/products/${req.body.id}`)
    },
    async delete(req, res) {
        await Product.delete(req.body.id)

        return res.redirect('/products/create')
    }
}