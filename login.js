const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const conexao = require('./bd'); // importa a conexão com o banco de dados MySQL (bd.js)


router.post('/', function(req, res) {
    var idLogin = req.body.idLogin;
    var senha = req.body.senha;
    

    // para ver o que está sendo recebido do formulário de login, descomente os console.log abaixo. Eles mostram o valor e o comprimento dos campos username e password, o que pode ajudar a identificar problemas de formatação ou envio dos dados.
    // console.log('Tentativa de login:');
    // console.log('Usuário recebido:', username, '(length:', username.length + ')');
    // console.log('Senha recebida:', password, '(length:', password.length + ')');

    // Consulta o banco de dados com placeholders corretos
    conexao.query('SELECT * FROM login WHERE idLogin = ? AND Senha = ?', [idLogin, senha], function(err, result, fields){
        if (err) {
            console.error('Erro na query:', err);
            res.redirect('/');
            return;
        }
               
if (result.length > 0) {

    console.log('Login bem-sucedido!');

    const usuario = result[0];

    req.session.usuario = {

        idusuario: usuario.idLogin,
        usuario: usuario.idLogin,
        usuariocol: usuario.usuariocol,
        nome: usuario.nome || null

    };

    res.redirect('home.html');

}
        else {
            console.log('Usuário ou senha incorretos - nenhum registro encontrado');
            res.redirect('/');
        }
    });
});

// ROTA DE DEBUG - REMOVER DEPOIS
    router.get('/debug-tableDB', (req, res) => {
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
