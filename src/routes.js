const express = require('express')
const { Router } = require('express')
const ProductController = require('./app/controllers/ProductController')

const routes = express.Router()

routes.get("/", (req, res) => {
    return res.render("layout.njk")
})

routes.get("/products/create", ProductController.create)
routes.post("/products", ProductController.post)

// Alias

routes.get("/ads/create", (req, res) => {
    return res.redirect("/products/create")
})

module.exports = routes
