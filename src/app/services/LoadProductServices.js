const { formatPrice, date } = require('../../lib/utils')
const Product = require('../models/Product')

async function getImages(productId) {
    let files = await Product.files(productId)

    files = files.map(file => ({
        ...file,
        src: `${file.path.replace('public', '')}`
    }))

    return files
}

async function format(product) {
    const files = await getImages(product.id)

    product.img = files[0].src
    product.files = files

    product.formattedOldPrice = formatPrice(product.old_price)
    product.formattedPrice = formatPrice(product.price)

    const { minutes, hours, day, month } = date(product.updated_at)

    product.published = {
        date: `${day}/${month}`,
        time: `${hours}h${minutes}`
    }

    return product
}

const LoadService = {
    load(service, filter) {
        this.filter = filter
        return this[service]()
    },
    product() {
        try {
            const product = await Product.findOne(this.filter)

            return format(product)
        } catch (error) {
            console.error(error)
        }
    },
    products() {
        try {
            const products = await Product.findAll(this.filter)

            const productsPromises = await products.map(format) // product => format(product)

            return Promise.all(productsPromises)
        } catch (error) {
            console.error(error)
        }
    },
    format
}

module.exports = LoadService