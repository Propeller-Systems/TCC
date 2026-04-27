// routes/avisos.js
// Arquivo que define as rotas (endpoints) relacionadas aos "avisos".
// Serve para o frontend (por exemplo, um app React) consumir as operações
// básicas de CRUD: Create, Read, Update e Delete.

const express = require('express'); // framework web (Express) usado para criar o servidor e rotas
const fs = require('fs'); // módulo nativo do Node para leitura/escrita de arquivos
const path = require('path'); // utilitários para manipular caminhos de arquivo de forma portável

const router = express.Router(); // instancia um roteador modular do Express para agrupar endpoints

// Caminho para o arquivo JSON que guarda os dados dos avisos.
// Usamos um arquivo simples como banco de dados leve.
const DB_PATH = path.join(__dirname, '../data/avisos.json');

// Função auxiliar: lê o arquivo JSON e retorna os dados (array de avisos).
// - Lê o conteúdo do arquivo usando leitura síncrona (mais simples aqui).
// - Converte o JSON para um objeto JavaScript com JSON.parse.
function lerAvisos(){
    const conteudo = fs.readFileSync(DB_PATH, 'utf-8');
    // 'conteudo' é a string lida do arquivo; JSON.parse transforma em objeto
    return JSON.parse(conteudo);
}

// Função auxiliar: salva os dados de volta no arquivo JSON.
// Recebe um array de avisos e sobrescreve o arquivo com o JSON formatado.
function salvarDados(avisos){
    fs.writeFileSync(DB_PATH, JSON.stringify(avisos, null, 2), 'utf-8');
}

// ─── READ: Buscar todos os avisos ───────────────────────────────────────────
// GET /api/avisos
// Retorna a lista completa de avisos presente no arquivo JSON.
router.get('/', (req, res) =>{
    try{
        const avisos = lerAvisos(); // carrega todos os avisos do arquivo
        res.json(avisos); // envia como JSON na resposta
    } catch (err) {
        // Em caso de erro de I/O ou parse, responde com 500
        res.status(500).json({ erro: 'Erro ao ler avisos' });
    }
});

// ─── READ: Buscar um aviso específico pelo ID ────────────────────────────────
// GET /api/avisos/:id
// Procura um aviso cujo campo 'id' corresponda ao parâmetro da URL.
router.get('/:id', (req, res) => {
    try {
        const avisos = lerAvisos();
        // parseInt converte o id da URL (string) para número
        const aviso = avisos.find(a => a.id === parseInt(req.params.id));
        if (!aviso) return res.status(404).json({ erro: 'Aviso não encontrado' });
        res.json(aviso);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao ler avisos' });
    }
});

// ─── CREATE: Criar novo aviso ────────────────────────────────────────────────
// POST /api/avisos
// Recebe os dados do novo aviso no corpo da requisição (req.body) e adiciona
// um novo objeto ao array, gerando um ID incremental.
router.post('/', (req,res) => {
    try {
        const avisos = lerAvisos(); // array atual de avisos

        // Gera um novo ID: pega o maior ID existente e soma 1, ou usa 1 se vazio
        const novoId = avisos.length > 0 ? Math.max(...avisos.map(a => a.id)) + 1 : 1;

        // Monta o novo aviso usando os campos enviados (com valores padrão)
        const novoAviso = {
            id: novoId,
            titulo: req.body.titulo || 'Sem título',
            conteudo: req.body.conteudo || '',
            autor: req.body.autor,
            // data no formato YYYY-MM-DD
            data: new Date().toISOString().split('T')[0],
            destaque: req.body.destaque || false
        };

        // Adiciona o novo aviso ao array e salva no arquivo
        avisos.push(novoAviso);
        salvarDados(avisos);

        // 201 = recurso criado com sucesso
        res.status(201).json(novoAviso);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar aviso' });
    }
});

// ─── UPDATE: Editar um aviso existente ──────────────────────────────────────
// PUT /api/avisos/:id
// Atualiza os campos do aviso com base no corpo da requisição.
router.put('/:id', (req, res) => {
    try {
        const avisos = lerAvisos();
        const index = avisos.findIndex(a => a.id === parseInt(req.params.id));

        if (index === -1) return res.status(404).json({ erro: 'Aviso não encontrado' });

        // Substitui os campos antigos pelos novos enviados em req.body,
        // preservando o ID original.
        avisos[index] = {
            ...avisos[index],    // mantém os campos que não foram alterados
            ...req.body,         // sobrescreve com os campos enviados
            id: avisos[index].id // garante que o ID não seja alterado
        };

        // Salva a lista atualizada no arquivo
        salvarDados(avisos);
        // Retorna o aviso atualizado
        res.json(avisos[index]);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar aviso' });
    }
});
 
// ─── DELETE: Deletar um aviso ────────────────────────────────────────────────
// DELETE /api/avisos/:id
// Remove o aviso cujo ID foi passado na URL.
router.delete('/:id', (req, res) => {
    try {
        const avisos = lerAvisos();
        // Filtra a lista removendo o aviso com o ID informado
        const novaLista = avisos.filter(a => a.id !== parseInt(req.params.id));

        // Se o tamanho não mudou, nenhum aviso foi removido => não encontrado
        if (novaLista.length === avisos.length) {
            return res.status(404).json({ erro: 'Aviso não encontrado' });
        }

        // Salva a nova lista sem o aviso removido
        salvarDados(novaLista);
        res.json({ mensagem: 'Aviso deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao deletar aviso' });
    }
});
 
module.exports = router;