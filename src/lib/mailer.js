const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '7f3e2b1fe02412',
        pass: '1c359af824bbfa'
    }
})