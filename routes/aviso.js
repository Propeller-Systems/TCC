const express = require("express"); // framework web (Express) usado para criar o servidor e rotas
const router = express.Router(); // instancia um roteador modular do Express para agrupar endpoints

const db = require("../bd"); // importa o módulo de conexão com o banco de dados MySQL (bd.js)

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

router.post("/", (req, res) => {

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
      req.body.idusuario,
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
router.put("/:id", (req, res) => {
  // fazer a config no modal para ter a opcao de editar
});

// ─── DELETE: Deletar um aviso ────────────────────────────────────────────────
// DELETE /api/avisos/:id
// Remove o aviso cujo ID foi passado na URL.
router.delete("/:id", (req, res) => {
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
