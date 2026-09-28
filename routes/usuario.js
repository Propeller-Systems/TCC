//CRUD do usuario.html
const express = require("express"); 
const router = express.Router();
const multer = require("multer");
const prisma = require("../prismaClient");
const admin = require('../middleware/admin');
const fs = require("fs");
const path = require("path");

// ─── Configuração de fotos ─────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/img/");
    },
    filename: (req, file, cb) => {
        const nomeArquivo = `foto-${Date.now()}.jpg`;
        cb(null, nomeArquivo);
    }
});
const upload = multer({ storage: storage }); // Configura o destino dos arquivos enviados

// ─── READ: Buscar todos os usuários ───────────────────────────────────────────
router.get("/", admin, async (req, res) => {
    try{
        const usuarios = await prisma.usuario.findMany({
            orderBy: {
                idusuario: "desc"
            }
        });
        res.json(usuarios);
    } 
    catch (error) { console.error("Erro ao buscar usuários:", error);
        res.status(500).json({ error: "Ocorreu um erro ao buscar os usuários."
        });
    }
});

// ─── CREATE: Criar novo usuário ────────────────────────────────────────────────
router.post("/", admin, upload.single('foto'), async (req, res) => {
    const { nome, email, usuariocol } = req.body;
    
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhuma imagem enviada." });
        }

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                usuariocol,
                foto: req.file.filename
            }
        });
        res.status(201).json(novoUsuario);
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        res.status(500).json({ error: "Ocorreu um erro ao criar o usuário." });
    }
});

// ─── UPDATE: Atualizar usuário ────────────────────────────────────────────────
router.put("/:id", admin, upload.single('foto'), async (req, res) => {
  const { id } = req.params;
  const { nome, email, usuariocol } = req.body;
  try {
    const data = {
      nome,
      email,
      usuariocol
    };
    if (req.file) {
      data.foto = req.file.filename;
    }
    const usuarioAtualizado = await prisma.usuario.update({
      where: {
        idusuario: parseInt(id)
      },
      data
    });
    res.json(usuarioAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({
      error: "Ocorreu um erro ao atualizar o usuário."
    });
  }
});

// ─── DELETE: Deletar usuário ────────────────────────────────────────────────
router.delete("/:id", admin, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await prisma.usuario.findUnique({
            where: {
                idusuario: parseInt(id)
            }
        });

        if (!usuario) {
            return res.status(404).json({
                error: "Usuário não encontrado."
            });
        }
        const caminhoFoto = path.join(
            __dirname,
            "../public/uploads",
            usuario.foto
        );
        if (usuario.foto && fs.existsSync(caminhoFoto)) {
            fs.unlinkSync(caminhoFoto);
        }
        await prisma.usuario.delete({
            where: {
                idusuario: parseInt(id)
            }
        });
        res.status(200).json({
            message: "Usuário e foto deletados com sucesso."
        });
    } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        res.status(500).json({
            error: "Erro ao deletar usuário."
        });}
});
module.exports = router;