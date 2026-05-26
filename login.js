const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const conexao = require('./bd'); // importa a conexão com o banco de dados MySQL (bd.js)


router.post('/', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;


    // para ver o que está sendo recebido do formulário de login, descomente os console.log abaixo. Eles mostram o valor e o comprimento dos campos username e password, o que pode ajudar a identificar problemas de formatação ou envio dos dados.
    // console.log('Tentativa de login:');
    // console.log('Usuário recebido:', username, '(length:', username.length + ')');
    // console.log('Senha recebida:', password, '(length:', password.length + ')');

    // Consulta o banco de dados com placeholders corretos
    conexao.query('SELECT * FROM login WHERE idLogin = ? AND Senha = ?', [idLogin, Senha], function(err, result, fields){
        if (err) {
            console.error('Erro na query:', err);
            res.redirect('/');
            return;
        }
               
        if (result.length > 0) {
            console.log('Login bem-sucedido!');
            res.redirect('/home.html');
        } else {
            console.log('Usuário ou senha incorretos - nenhum registro encontrado');
            res.redirect('/');
        }
    });
});

// ROTA DE DEBUG - REMOVER DEPOIS
    router.get('/', (req, res) => {
    // coloque '/debug-tabela-login' na barra de endereços para ver o resultado da consulta e tire de comentarios o "Mostra os nomes das colunas" para ver os nomes das colunas da tabela
    conexao.query('SELECT * FROM login', (err, result, fields) => {
        if (err) {
            res.json({ erro: err });
            return;
        }
        
        // Mostra os nomes das colunas
        const nomesColunas = fields.map(field => field.name);
        
        res.json({
            colunas: nomesColunas,
            dados: result,
            totalRegistros: result.length
        });
    });
});

module.exports = router; // exporta o roteador para ser usado em outros arquivos (como app.js)
