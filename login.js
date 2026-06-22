const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const prisma = require("./prismaClient");

router.post("/", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findFirst({
      where: {
        email: email,
        senha: senha
      }
    });

    if (!usuario) {
      console.log("Usuário ou senha incorretos");
      return res.redirect("/");
    }

    req.session.usuario = {
      idusuario: usuario.idusuario,
      nome: usuario.nome,
      usuariocol: usuario.usuariocol
    };

    console.log("Login bem-sucedido!");
    res.redirect("/home.html");

  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

module.exports = router; // exporta o roteador para ser usado em outros arquivos (como app.js)
