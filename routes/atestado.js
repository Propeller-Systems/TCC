
const express = require("express");
const router = express.Router();

const multer = require("multer");
const prisma = require("../prismaClient");

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Pasta privada, fora de public
const pastaAtestados = path.join(__dirname, "../uploads/atestados");

fs.mkdirSync(pastaAtestados, { recursive: true });

// Tipos de imagem permitidos
const tiposPermitidos = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pastaAtestados);
    },

    filename: (req, file, cb) => {
        const extensao = tiposPermitidos[file.mimetype];

        const nomeArquivo = `${crypto.randomUUID()}${extensao}`;

        cb(null, nomeArquivo);
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    },

    fileFilter: (req, file, cb) => {
        if (!tiposPermitidos[file.mimetype]) {
            return cb(new Error("Formato de imagem não permitido."));
        }

        cb(null, true);
    }
});

// Middleware: somente funcionários podem enviar
function funcionario(req, res, next) {
    if (req.session.usuario.usuariocol !== "funcionario") {
        return res.status(403).json({
            error: "Apenas funcionários podem enviar atestados."
        });
    }

    next();
}

// Middleware: somente administradores podem consultar
function somenteAdmin(req, res, next) {
    if (req.session.usuario.usuariocol !== "admin") {
        return res.status(403).json({
            error: "Acesso permitido somente para administradores."
        });
    }

    next();
}

// POST /api/atestados
// Funcionário envia um atestado
router.post("/", funcionario, (req, res, next) => {
    upload.single("arquivo")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                error: err.code === "LIMIT_FILE_SIZE"
                    ? "A imagem deve ter no máximo 10 MB."
                    : "Erro ao enviar a imagem."
            });
        }

        if (err) {
            return res.status(400).json({
                error: err.message || "Arquivo inválido."
            });
        }

        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Nenhuma imagem foi enviada."
            });
        }

        // O ID vem da sessão, nunca do formulário
        const idusuario = req.session.usuario.idusuario;

        const novoAtestado = await prisma.atestado.create({
            data: {
                caminho: req.file.filename,
                idusuario
            }
        });

        return res.status(201).json({
            mensagem: "Atestado enviado com sucesso.",
            atestado: novoAtestado
        });

    } catch (error) {
        // Remove o arquivo caso o registro no banco falhe
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        console.error("Erro ao salvar atestado:", error);

        return res.status(500).json({
            error: "Não foi possível salvar o atestado."
        });
    }
});

// GET /api/atestados
// Administrador consulta todos os atestados
router.get("/", somenteAdmin, async (req, res) => {
    try {
        const atestados = await prisma.atestado.findMany({
            include: {
                usuario: {
                    select: {
                        idusuario: true,
                        nome: true,
                        email: true
                    }
                }
            },
            orderBy: {
                dtEnvio: "desc"
            }
        });

        res.json(atestados);

    } catch (error) {
        console.error("Erro ao buscar atestados:", error);

        res.status(500).json({
            error: "Erro ao buscar atestados."
        });
    }
});

// GET /api/atestados/:id/arquivo
// Administrador acessa a imagem de um atestado
router.get("/:id/arquivo", somenteAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "ID inválido."
            });
        }

        const atestado = await prisma.atestado.findUnique({
            where: {
                idatestado: id
            }
        });

        if (!atestado) {
            return res.status(404).json({
                error: "Atestado não encontrado."
            });
        }

        const caminhoArquivo = path.join(
            pastaAtestados,
            path.basename(atestado.caminho)
        );

        if (!fs.existsSync(caminhoArquivo)) {
            return res.status(404).json({
                error: "Arquivo não encontrado."
            });
        }

        res.sendFile(caminhoArquivo);

    } catch (error) {
        console.error("Erro ao acessar atestado:", error);

        res.status(500).json({
            error: "Erro ao acessar o arquivo."
        });
    }
});

module.exports = router;
