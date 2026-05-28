const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const conexao = require('../bd');

router.post('/', (req, res) => {

    const { idLogin, senha } = req.body;
    const sql = `
        SELECT * FROM usuarios
        WHERE idLogin = ?
    `;


    conexao.query(sql, [idLogin], async (erro, resultado) => {

        if (erro) {
            console.log(erro);
            return res.send('Erro no servidor');
        }
        if (resultado.length === 0) {
            return res.send('Usuário não encontrado');
        }
        const usuarioBanco = resultado[0];
        const senhaCorreta = await bcrypt.compare(
            senha,
            usuarioBanco.senha
        );
        if (!senhaCorreta) {
            return res.send('Senha incorreta');
        }
        req.session.usuario = {

            id: usuarioBanco.id,
            idLogin: usuarioBanco.idLogin,
            usuariocol: usuarioBanco.usuariocol

        };
            
        if(usuarioBanco.usuariocol === 'admin') {
           return res.redirect('/home.html');
        } if(usuarioBanco.usuariocol === 'funcionario') {
            return res.redirect('/aviso.html');
        }

        res.send('Login bem-sucedido');

    });
});


router.get('/logout', (req, res) => {

    req.session.destroy();

    res.send('Logout realizado');

});


module.exports = router;
