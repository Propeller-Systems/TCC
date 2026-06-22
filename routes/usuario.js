//CRUD do usuario.html
const express = require("express"); 
const router = express.Router();
const prisma = require("../prismaClient");
const admin = require('../middleware/admin');


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
router.post("/", admin, async (req, res) => {
    const { nome, email, senha, usuariocol } = req.body;

    try {
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha,
                usuariocol
            }
        });
        res.status(201).json(novoUsuario);
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        res.status(500).json({ error: "Ocorreu um erro ao criar o usuário." });
    }
});

// ─── UPDATE: Atualizar usuário ────────────────────────────────────────────────

// ─── DELETE: Deletar usuário ────────────────────────────────────────────────


module.exports = router;