const db = require('../../config/db')

const Base = require('./Base')

Base.init({ table: 'products' })

module.exports = {
    ...Base,
    async files(id) {
        try {
            await db.query(`SELECT * FROM files WHERE product_id = $1`, [id])

            return results.rows
        } catch (error) {
            console.error(error)
        }
    },
    search({ filter, category }) {
        try {
            let query = '',
                filterQuery = ''

            if (category) {
                filterQuery += `AND products.category_id = ${category}`
            }

            if (filter) {
                filterQuery += `
                AND (products.name ILIKE '%${filter}%' OR products.description ILIKE '%${filter}%')
            `
            }

            query = `
            SELECT products.*, categories.name AS category_name
            FROM products
            LEFT JOIN categories ON (categories.id = products.category_id)
            WHERE 1 = 1
            ${filterQuery}
        `

            return db.query(query)
        } catch (error) {
            console.error(error)
        }
    }
}


