const db = require('../../config/db')

module.exports = {
    async all() {
        const results = await db.query(`SELECT * FROM products ORDER BY updated_at DESC`)

        return results.rows
    },
    async create(data) {
        try {
            const query = `
            INSERT INTO products (
                category_id,
                user_id,
                name,
                description,
                old_price,
                price,
                quantity,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
            `

            data.price = data.price.replace(/\D/g, "")

            const values = [
                data.category_id,
                data.user_id,
                data.name,
                data.description,
                data.old_price || data.price,
                data.price,
                data.quantity,
                data.status || 1,
            ]

            const results = await db.query(query, values)
            return results.rows[0].id
        } catch (error) {
            console.error(error)
        }

    },
    async find(id) {
        try {
            const results = await db.query(`SELECT * FROM products WHERE id = $1`, [id])

            return results.rows[0]
        } catch (error) {
            console.error(error)
        }
    },
    update(data) {
        try {
            const query = `
            UPDATE products SET
                category_id=($1),
                name=($2), 
                description=($3), 
                old_price=($4), 
                price=($5), 
                quantity=($6), 
                status=($7)
            WHERE id = $8
        `

            const values = [
                data.category_id,
                data.name,
                data.description,
                data.old_price,
                data.price,
                data.quantity,
                data.status,
                data.id
            ]

            return db.query(query, values)
        } catch (error) {
            console.error(error)
        }
    },
    delete(id) {
        try {
            return db.query(`DELETE FROM products WHERE id = $1`, [id])
        } catch (error) {
            console.error(error)
        }
    },
    files(id) {
        try {
            return db.query(`SELECT * FROM files WHERE product_id = $1`, [id])
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

