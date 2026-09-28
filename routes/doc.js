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

module.exports = router;