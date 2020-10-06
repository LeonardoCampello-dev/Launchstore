const Product = require('../models/Product')
const { format } = require('../services/LoadProductServices')

module.exports = {
    async index(req, res) {
        try {
            let params = {}

            const { filter, category } = req.query

            if (!filter) return res.render('search/index.njk', {
                error: 'Nenhum filtro foi inserido!'
            })

            params.filter = filter

            if (category) {
                params.category = category
            }

            let products = await Product.search(params)

            const productsPromises = products.map(format)

            products = await Promise.all(productsPromises)

            const search = {
                term: req.query.filter,
                total: products.length
            }

            const categories = products.map(product => ({
                id: product.category_id,
                name: product.category_name,
            }))
                .reduce((categoriesFiltered, category) => {

                    const found = categoriesFiltered.some(cat => cat.id == category.id)

                    if (!found) categoriesFiltered.push(category)

                    return categoriesFiltered
                }, [])

            return res.render('search/index.njk', { products, search, categories })
        } catch (error) {
            console.error(error)
        }
    }
}