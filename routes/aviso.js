const express = require("express"); // framework web (Express) usado para criar o servidor e rotas
const router = express.Router(); // instancia um roteador modular do Express para agrupar endpoints

const db = require("../bd"); // importa o módulo de conexão com o banco de dados MySQL (bd.js)
const admin = require('../middleware/admin');

// ─── READ: Buscar todos os avisos ───────────────────────────────────────────
router.get("/:grupo", (req, res) => {

  const grupo = req.params.grupo;

  let sql = `
    SELECT 
      a.idaviso,
      a.titulo,
      a.conteudo,
      a.escopo,
      DATE_FORMAT(a.date, '%Y-%m-%d') AS data,
      u.nome AS autor
    FROM aviso a
    JOIN usuario u 
      ON a.idusuario = u.idusuario
  `;

  const params = [];

  // ADMIN vê tudo
  if (grupo !== "admin") {

    sql += `
      WHERE
        a.escopo = ?
        OR a.escopo = 'geral'
    `;

    params.push(grupo);
  }

  sql += `
    ORDER BY a.idaviso DESC
  `;

  db.query(sql, params, (err, result) => {

    if (err) {
      console.error(err);

      return res.status(500).json({
        erro: err.message
      });
    }

    res.json(result);
  });
});

// ─── CREATE: Criar novo aviso ────────────────────────────────────────────────

router.post("/", admin, (req, res) => {
  console.log('POST /api/avisos body:', req.body);
  console.log('POST /api/avisos session.usuario:', req.session ? req.session.usuario : null);

  // Usa o id do usuário armazenado na sessão em vez de confiar no cliente
  const idusuario = req.session && req.session.usuario ? req.session.usuario.idusuario : null;

  if (!idusuario) {
    console.warn('Tentativa de criar aviso sem idusuario na sessão');
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  db.query(
    `
    INSERT INTO aviso
    (titulo, conteudo, date, idusuario, escopo)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      req.body.titulo,
      req.body.conteudo,
      new Date(),
      idusuario,
      req.body.escopo
    ],
    (err, result) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          erro: err.message
        });
      }

      res.status(201).json({
        message: "Aviso criado com sucesso",
        id: result.insertId
      });
    }
  );
});

// ─── UPDATE: Editar um aviso existente ──────────────────────────────────────
// PUT /api/avisos/:id
// Atualiza os campos do aviso com base no corpo da requisição.
router.put("/:id",admin , (req, res) => {
  // fazer a config no modal para ter a opcao de editar
});

// ─── DELETE: Deletar um aviso ────────────────────────────────────────────────
// DELETE /api/avisos/:id
// Remove o aviso cujo ID foi passado na URL.
router.delete("/:id", admin, (req, res) => {
  console.log("ID do aviso a ser deletado:", req.params.id); // Log para verificar o ID recebido
  db.query(
    "DELETE FROM aviso WHERE idaviso = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro ao deletar aviso" });
      }
      res.json({ mensagem: "Aviso deletado com sucesso" });
    },
  );
});

module.exports = router;
