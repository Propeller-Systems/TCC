// routes/avisos.js
// Aqui ficam todas as "rotas" (endereços) que o React vai usar
// para buscar, criar, editar e deletar avisos.
// CRUD = Create (criar), Read (ler), Update (atualizar), Delete (deletar)

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Caminho para o arquivo JSON que guarda os dados
const DB_PATH = path.join(__dirname, '../data/avisos.json');

// Função auxiliar: lê o arquivo JSON e retorna os dados
function lerAvisos(){
    const conteudo = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse('conteudo');
}

// Função auxiliar: salva os dados de volta no arquivo JSON
function salvarDados(avisos){
    fs.writeFileSync(DB_PATH, JSON.stringify(avisos, null, 2), 'utf-8');
}

// ─── READ: Buscar todos os avisos ───────────────────────────────────────────
// Quando o React faz GET /api/avisos, ele recebe a lista completa
router.get('/', (req, res) =>{
    try{
        const avisos = lerAvisos();
        res.json(avisos);
    } catch (err) {
        res.status(500).json({ erro: 'Erro em ler avisos'});
    }
});

// ─── READ: Buscar um aviso específico pelo ID ────────────────────────────────
// Quando o React faz GET /api/avisos/:id, ele recebe o aviso com aquele ID
router.get('/:id', (req, res) => {
    try {
        const avisos = lerAvisos();
        const aviso = avisos.find(a => a.id === parseInt(req.params.id))
        if (!aviso) return res.status(404).json({ erro: 'Aviso não encontrado' });
        res.json(aviso);
    } catch (err) {
        res.status(500).json({ erro: 'Erro em ler avisos'});
    }
});

// ─── CREATE: Criar novo aviso ────────────────────────────────────────────────
// O React envia os dados do novo aviso no corpo da requisição
router.post('/', (req,res) => {
    try {
        const aviso = lerAvisos();

        // Gera um ID novo (pega o maior ID existente e soma 1)
        const novoId =aviso.length >0 ? Math.max(... avisos.map(a => a.id)) + 1 : 1;

        const novoAviso = {
            id: novoId,
            titulo: req.body.titulo || 'Sem título',
            conteudo: req.body.conteudo || '',
            autor: req.body.autor,
            data,
        }
    }
}g