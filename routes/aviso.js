const express = require("express"); // framework web (Express) usado para criar o servidor e rotas
const router = express.Router(); // instancia um roteador modular do Express para agrupar endpoints
const prisma = require("../prismaClient");
const admin = require('../middleware/admin');

// ─── READ: Buscar todos os avisos ───────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const avisos = await prisma.aviso.findMany({
      include: {
        usuario: true
      },
      orderBy: {
        idaviso: 'desc'
      }
    });
    res.json(avisos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar avisos' });
  }
});

// ─── CREATE: Criar novo aviso ────────────────────────────────────────────────
router.post("/", admin, async (req, res) => {
  try{
    const { titulo, conteudo, escopo, idusuario } = req.body;
    
    const novoAviso =  await prisma.aviso.create({
      data: {
        titulo,
        conteudo,
        date: new Date(),
        escopo,
        idusuario: idusuario || req.session.usuario.idusuario // Usa o ID do usuário logado se não for fornecido no corpo da requisição
      }
    });
    
    res.status(201).json(novoAviso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar aviso' });
  }
});


// ─── UPDATE: Editar um aviso existente ──────────────────────────────────────
// PUT /api/avisos/:id
// Atualiza os campos do aviso com base no corpo da requisição.
router.put("/:id", admin, async (req, res) => {
    const id = Number(req.params.id);
    const { titulo, conteudo, escopo } = req.body;
    try {
        const avisoAtualizado = await prisma.aviso.update({
            where: {
                idaviso: id
            },
            data: {
                titulo,
                conteudo,
                escopo
            }
        });
        res.json(avisoAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar aviso:", error);
        res.status(500).json({
            error: "Erro ao atualizar aviso."
        });
    }
});

// ─── DELETE: Deletar um aviso ────────────────────────────────────────────────
// DELETE /api/avisos/:id
router.delete("/:id", admin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.aviso.delete({
      where: {
        idaviso: parseInt(id)
      }
    });
    res.status(200).json({ message: 'Aviso deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar aviso' });
  }
});

module.exports = router;
