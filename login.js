const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
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
    if (usuario.senha !== senha) {
      console.log("senha incorreta");
      return res.redirect("/");
    }

    await prisma.usuario.update({
      where: {
        idusuario: usuario.idusuario
      },
      data: {
        estado: 1
      }
    });

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

router.post("/logout", async (req, res) => {
  try {
    const idusuario = req.session.usuario?.idusuario;

    if (idusuario) {
      await prisma.usuario.update({
        where: {
          idusuario: idusuario
        },
        data: {
          estado: 0
        }
      });
    }

    req.session.destroy((error) => {
      if (error) {
        console.error("Erro ao encerrar sessão:", error);
        return res.status(500).send("Não foi possível encerrar a sessão.");
      }

      res.clearCookie("connect.sid", { path: "/" });
      return res.redirect("/");
    });

  } catch (error) {
    console.error("Erro ao atualizar estado do usuário:", error);
    return res.status(500).send("Erro ao realizar logout.");
  }
});

module.exports = router; // exporta o roteador para ser usado em outros arquivos (como app.js)
