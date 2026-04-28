const express = require('express'); // framework web (Express) usado para criar o servidor e rotas
const router = express.Router(); // instancia um roteador modular do Express para agrupar endpoints

const db = require('../bd'); // importa o módulo de conexão com o banco de dados MySQL (bd.js)

// ─── READ: Buscar todos os avisos ───────────────────────────────────────────
router.get('/', (req, res) => {
    const sql = `
        SELECT 
            a.idaviso,
            a.titulo,
            a.conteudo,
            a.escopo,
            a.\`date\`,
            u.nome AS autor
        FROM aviso a
        JOIN usuario u ON a.idusuario = u.idusuario
        ORDER BY a.idaviso DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: 'Erro ao buscar avisos' });
        }

        res.json(result);
    });
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