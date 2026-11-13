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

router.put("/:id", admin, upload.single("arquivo"), async (req, res) => {
    const { id } = req.params;
    const { titulo, texto } = req.body;

    try {
        const documentoAtual = await prisma.documento.findUnique({
            where: { iddocumento: Number(id) }
        });

        if (!documentoAtual) {
            return res.status(404).json({ error: "Documento não encontrado." });
        }

        const dadosAtualizados = {
            titulo: titulo ?? documentoAtual.titulo,
            texto: texto ?? documentoAtual.texto
        };

        if (req.file) {
            dadosAtualizados.caminho = req.file.filename;
        }

        const documentoAtualizado = await prisma.documento.update({
            where: { iddocumento: Number(id) },
            data: dadosAtualizados
        });

        res.json(documentoAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar documento:", error);
        res.status(500).json({ error: "Erro ao atualizar documento." });
    }
});

router.delete("/:id", admin, async (req, res) => {
    const { id } = req.params;

    try {
        const documento = await prisma.documento.findUnique({
            where: { iddocumento: Number(id) }
        });

        if (!documento) {
            return res.status(404).json({ error: "Documento não encontrado." });
        }

        const caminhoArquivo = path.join(__dirname, "../public/uploads/doc", documento.caminho);

        if (fs.existsSync(caminhoArquivo)) {
            fs.unlinkSync(caminhoArquivo);
        }

        await prisma.documento.delete({
            where: { iddocumento: Number(id) }
        });

        res.json({ mensagem: "Documento excluído com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir documento:", error);
        res.status(500).json({ error: "Erro ao excluir documento." });
    }
});

module.exports = router;