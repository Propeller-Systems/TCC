const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const bycrpt = require("bcrypt");
const prisma = require("./prismaClient");

router.post("/", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: {
        email: email,
      }
    });

    if (!usuario) {
      console.log("Usuário incorreto");
      return res.redirect("/");
    }
    console.log(senha)
    console.log(usuario.senha)

    // const senhaCorreta = await bycrpt.compare(
    //   senha,
    //   usuario.senha
    // )
    if(usuario.senha !== senha){
      console.log("senha incorreta");
      return res.redirect("/");
    }



    req.session.usuario = {
      idusuario: usuario.idusuario,
      nome: usuario.nome,
      email: usuario.email,
      usuariocol: usuario.usuariocol
    };

    console.log("Login bem-sucedido!");
    if (usuario.usuariocol === "admin") {
      return res.redirect("/home.html");
    }

    return res.redirect("/avisos.html");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

module.exports = router; // exporta o roteador para ser usado em outros arquivos (como app.js)
