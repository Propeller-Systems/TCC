const express = require("express"); 
const router = express.Router();
const multer = require("multer");
const prisma = require("../prismaClient");
const admin = require('../middleware/admin');
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/doc/");
    },
    filename: (req, file, cb) => {
        const extensao = path.extname(file.originalname).toLowerCase();
        const nomeArquivo = `documento-${Date.now()}${extensao}`;
        cb(null, nomeArquivo);
    }
});

const upload = multer({ storage: storage });

router.get("/",admin, async (req, res) => {
        try {
            const documentos =
                await prisma.documento.findMany({
                    orderBy: {
                        iddocumento: "desc"
                    }
                });
            res.json(documentos);
        } catch (error) {
            console.error(
                "Erro ao buscar documentos:",
                error
            );
            res.status(500).json({
                mensagem: "Erro ao buscar documentos."
            });
        }});

router.post("/", admin, upload.single("arquivo"), async (req, res) => {
    const { titulo, texto} = req.body;
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Nenhum documento enviado."
            });
        }
        const novoDocumento = await prisma.documento.create({
            data: {
                titulo,
                texto,
                caminho: req.file.filename
            }
        });
        res.status(201).json(novoDocumento);

    } catch (error) {
        console.error("Erro ao criar documento:", error);
        res.status(500).json({
            error: "Ocorreu um erro ao criar o documento."
        });
    }
});

module.exports = router;