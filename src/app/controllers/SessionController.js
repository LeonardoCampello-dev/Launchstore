const crypto = require('crypto')
const mailer = require('../../lib/mailer')

const User = require('../models/User')

module.exports = {
    loginForm(req, res) {
        return res.render('session/login.njk')
    },
    login(req, res) {
        req.session.userId = req.user.id

        return res.redirect('/users')
    },
    logout(req, res) {
        req.session.destroy()

        return res.redirect('/')
    },
    forgotForm(req, res) {
        return res.render('session/forgot-password.njk')
    },
    async forgot(req, res) {
        try {
            const user = req.user

            const token = crypto.randomBytes(20).toString('hex')

            // token expiration
            let now = new Date()
            now = now.setHours(now.getHours() + 1)

            await User.update(user.id, {
                reset_token: token,
                reset_token_expires: now
            })

            await mailer.sendMail({
                from: 'no-reply@launchstore.com.br',
                to: user.email,
                subject: 'Recuperação de senha',
                html: `
                <h2>Esqueceu sua senha?</h2>
    
                <p>Não se preocupe, clique no link abaixo para recuperá-la</p>
    
                <p>
                    <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
                        RECUPERAR SENHA
                    </a>
                </p>
                `
            })

            return res.render('session/forgot-password.njk', {
                success: 'Verifique a caixa de entrada do seu email para recuperar a senha!'
            })
        } catch (error) {
            console.error(error)
            return res.render('session/forgot-password.njk', {
                error: 'Erro inesperado, tente novamente!'
            })
        }
    }
}