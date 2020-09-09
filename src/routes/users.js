const express = require('express')
const routes = express.Router()

const SessionController = require('../app/controllers/SessionController')
const UserController = require('../app/controllers/UserController')

// Login/Logout -- SessionController

// routes.get('/login', SessionController.loginForm)
// routes.post('/login', SessionController.login)
// routes.post('/logout', SessionController.logout)

// // Reset password/Forgot -- SessionController

// routes.get('/forgot-password', SessionController.forgotForm)
// routes.get('/reset-password', SessionController.resetForm)
// routes.post('/forgot-password', SessionController.forgot)
// routes.post('/reset-password', SessionController.reset)

// // Users -- UserController

routes.get('/register', UserController.create)
// routes.post('/register', UserController.post)

// routes.get('/', UserController.show)
// routes.put('/', UserController.put)
// routes.delete('/', UserController.delete)


module.exports = routes
