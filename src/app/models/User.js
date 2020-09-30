const Base = require('./Base')

Base.init({ table: 'users' })

module.exports = {
    ...Base,
}

// async delete(id) { 📌 Ajustar regras de negócio
//     let results = await db.query(`SELECT * FROM products WHERE user_id = $1`, [id])
//     const products = results.rows

//     const allFilesPromises = products.map(product => Product.files(product.id))
//     let promiseResults = await Promise.all(allFilesPromises)

//     await db.query(`DELETE FROM users WHERE id = $1`, [id])

//     promiseResults.map(results => {
//         results.rows.map(file => {
//             try {
//                 fs.unlinkSync(file.path)
//             } catch (error) {
//                 console.error(error)
//             }
//         })
//     })
// }