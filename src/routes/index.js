const express = require('express')
const routes = express.Router()

const HomeController = require('../app/controllers/HomeController')

const products = require('./products')
const users = require('./users')

routes.use('/products', products)
routes.use('/users', users)

routes.get('/', HomeController.index)

// Alias
routes.get('/ads/create', (req, res) => {
    return res.redirect('/products/create')
})

routes.get('/accounts', (req, res) => {
    return res.redirect('/users/login')
})

module.exports = routes
