const crypto = require("crypto");
const mailer = require("../../lib/mailer");
const { hash } = require("bcryptjs");

const User = require("../models/User");

module.exports = {
  loginForm(req, res) {
    return res.render("session/login.njk");
  },
  login(req, res) {
    req.session.userId = req.user.id;

    return res.redirect("/users");
  },
  logout(req, res) {
    req.session.destroy();

    return res.redirect("/");
  },
  forgotForm(req, res) {
    return res.render("session/forgot-password.njk");
  },
  async forgot(req, res) {
    try {
      const user = req.user;

      const token = crypto.randomBytes(20).toString("hex");

      // token expires
      let now = new Date();
      now = now.setHours(now.getHours() + 1);

      await User.update(user.id, {
        reset_token: token,
        reset_token_expires: now,
      });

      await mailer.sendMail({
        from: "no-reply@launchstore.com.br",
        to: user.email,
        subject: "Recuperação de senha 🗝",
        html: `
                <h2>Esqueceu sua senha? 😟</h2>
    
                <p>Não se preocupe, clique no link abaixo para recuperá-la</p>
    
                <p>
                    <a href="http://localhost:3000/users/reset-password?token=${token}" target="_blank">
                        RECUPERAR SENHA
                    </a>
                </p>
                `,
      });

      return res.render("session/forgot-password.njk", {
        success:
          "Verifique a caixa de entrada do seu email para recuperar a senha!",
      });
    } catch (error) {
      console.error(error);
      return res.render("session/forgot-password.njk", {
        error: "Erro inesperado, tente novamente!",
      });
    }
  },
  resetForm(req, res) {
    return res.render("session/reset-password.njk", { token: req.query.token });
  },
  async reset(req, res) {
    const { password, token } = req.body;

    try {
      const user = req.user;

      const newPassword = await hash(password, 8);

      await User.update(user.id, {
        password: newPassword,
        reset_token: "",
        reset_token_expires: "",
      });

      return res.render("session/login.njk", {
        user: req.body,
        success: "Senha atualizada com sucesso! Faça seu login.",
      });
    } catch (error) {
      console.error(error);
      return res.render("session/reset-password.njk", {
        user: req.body,
        token,
        error: "Erro inesperado, tente novamente!",
      });
    }
  },
};
