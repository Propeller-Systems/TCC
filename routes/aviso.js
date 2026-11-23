
const express = require("express");
const router = express.Router();

const prisma = require("../prismaClient");
const admin = require("../middleware/admin");

// Busca os avisos conforme o tipo de usuário.
router.get("/", async (req, res) => {
  try {
    const usuario = req.session.usuario;

    let where = {};

    // Administradores conseguem visualizar todos os avisos.
    if (usuario.usuariocol !== "admin") {
      const idusuario = Number(usuario.idusuario);

      where = {
        OR: [
          // Avisos gerais.
          {
            escopo: "geral"
          },

          // Avisos para todos os funcionários.
          // Não possuem destinatários cadastrados.
          {
            escopo: "funcionario",
            aviso_destinatario: {
              none: {}
            }
          },

          // Avisos destinados ao funcionário logado.
          {
            escopo: "funcionario",
            aviso_destinatario: {
              some: {
                idusuario: idusuario
              }
            }
          }
        ]
      };
    }

    const avisos = await prisma.aviso.findMany({
      where,
      include: {
        usuario: {
          select: {
            idusuario: true,
            nome: true,
            email: true,
            usuariocol: true,
            foto: true
          }
        },
        aviso_destinatario: {
          include: {
            usuario: {
              select: {
                idusuario: true,
                nome: true,
                email: true,
                usuariocol: true,
                foto: true
              }
            }
          }
        }
      },
      orderBy: {
        idaviso: "desc"
      }
    });

    res.json(avisos);

  } catch (error) {
    console.error("Erro ao buscar avisos:", error);

    res.status(500).json({
      error: "Erro ao buscar avisos."
    });
  }
});


// CREATE: Criar aviso.
router.post("/", admin, async (req, res) => {
  try {
    const { titulo, conteudo, escopo, destinatarios } = req.body;

    // Validação dos campos obrigatórios.
    if (!titulo || !conteudo || !["geral", "funcionario"].includes(escopo)) {
      return res.status(400).json({
        error: "Preencha os campos corretamente."
      });
    }

    // Avisos gerais não precisam de destinatários.
    let idsDestinatarios = [];

    if (escopo === "funcionario") {
      if (destinatarios !== undefined && !Array.isArray(destinatarios)) {
        return res.status(400).json({
          error: "A lista de destinatários é inválida."
        });
      }

      idsDestinatarios = [
        ...new Set((destinatarios || []).map(Number))
      ];

      if (idsDestinatarios.some(id => !Number.isInteger(id) || id <= 0)) {
        return res.status(400).json({
          error: "Existem IDs de destinatários inválidos."
        });
      }

      // Confirma se todos os IDs pertencem a funcionários.
      if (idsDestinatarios.length > 0) {
        const funcionarios = await prisma.usuario.findMany({
          where: {
            idusuario: {
              in: idsDestinatarios
            },
            usuariocol: "funcionario"
          },
          select: {
            idusuario: true
          }
        });

        if (funcionarios.length !== idsDestinatarios.length) {
          return res.status(400).json({
            error: "Um ou mais destinatários não são funcionários válidos."
          });
        }
      }
    }

    const novoAviso = await prisma.$transaction(async (tx) => {
      const aviso = await tx.aviso.create({
        data: {
          titulo,
          conteudo,
          escopo,
          idusuario: req.session.usuario.idusuario
        }
      });

      // Registra os destinatários selecionados.
      if (idsDestinatarios.length > 0) {
        await tx.aviso_destinatario.createMany({
          data: idsDestinatarios.map(idusuario => ({
            idaviso: aviso.idaviso,
            idusuario
          }))
        });
      }

      return tx.aviso.findUnique({
        where: {
          idaviso: aviso.idaviso
        },
        include: {
          usuario: {
            select: {
              idusuario: true,
              nome: true,
              email: true,
              usuariocol: true,
              foto: true
            }
          },
          aviso_destinatario: {
            include: {
              usuario: {
                select: {
                  idusuario: true,
                  nome: true,
                  email: true,
                  usuariocol: true,
                  foto: true
                }
              }
            }
          }
        }
      });
    });

    res.status(201).json(novoAviso);

  } catch (error) {
    console.error("Erro ao criar aviso:", error);

    res.status(500).json({
      error: "Erro ao criar aviso."
    });
  }
});


// UPDATE: Editar aviso e seus destinatários.
router.put("/:id", admin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titulo, conteudo, escopo, destinatarios } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "ID do aviso inválido."
      });
    }

    if (!titulo || !conteudo || !["geral", "funcionario"].includes(escopo)) {
      return res.status(400).json({
        error: "Preencha os campos corretamente."
      });
    }

    let idsDestinatarios = [];

    if (escopo === "funcionario") {
      if (destinatarios !== undefined && !Array.isArray(destinatarios)) {
        return res.status(400).json({
          error: "A lista de destinatários é inválida."
        });
      }

      idsDestinatarios = [
        ...new Set((destinatarios || []).map(Number))
      ];

      if (idsDestinatarios.some(id => !Number.isInteger(id) || id <= 0)) {
        return res.status(400).json({
          error: "Existem IDs de destinatários inválidos."
        });
      }

      if (idsDestinatarios.length > 0) {
        const funcionarios = await prisma.usuario.findMany({
          where: {
            idusuario: {
              in: idsDestinatarios
            },
            usuariocol: "funcionario"
          },
          select: {
            usuario: {
              select: {
                idusuario: true,
                nome: true,
                email: true,
                usuariocol: true,
                foto: true
              }
            }
          }
        });

        if (funcionarios.length !== idsDestinatarios.length) {
          return res.status(400).json({
            error: "Um ou mais destinatários não são funcionários válidos."
          });
        }
      }
    }

    const avisoAtualizado = await prisma.$transaction(async (tx) => {
      await tx.aviso.update({
        where: {
          idaviso: id
        }, data: {
          titulo,
          conteudo,
          escopo
        }
      });

      // Remove os destinatários antigos.
      await tx.aviso_destinatario.deleteMany({
        where: {
          idaviso: id
        }
      });

      // Cadastra os novos destinatários.
      if (idsDestinatarios.length > 0) {
        await tx.aviso_destinatario.createMany({
          data: idsDestinatarios.map(idusuario => ({
            idaviso: id,
            idusuario
          }))
        });
      }

      return tx.aviso.findUnique({
        where: {
          idaviso: id
        }, include: {
          usuario: {
            select: {
              idusuario: true,
              nome: true,
              email: true,
              usuariocol: true,
              foto: true
            }
          },
          aviso_destinatario: {
            include: {
              usuario: {
                select: {
                  idusuario: true,
                  nome: true,
                  email: true,
                  usuariocol: true,
                  foto: true
                }
              }
            }
          }
        }
      });
    });
    res.json(avisoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar aviso:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Aviso não encontrado."
      });
    }
    res.status(500).json({
      error: "Erro ao atualizar aviso."
    });
  }
});


// DELETE: Excluir aviso.
router.delete("/:id", admin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "ID do aviso inválido."
      });
    }
    await prisma.aviso.delete({
      where: {
        idaviso: id
      }
    });
    res.json({
      message: "Aviso deletado com sucesso."
    });
  } catch (error) {
    console.error("Erro ao deletar aviso:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Aviso não encontrado."
      });
    }
    res.status(500).json({
      error: "Erro ao deletar aviso."
    });
  }
});

module.exports = router;
