// app.js — Servidor principal
// Este arquivo é o "coração" do backend. Ele:
//   1. Serve os arquivos do seu site (pasta public/)
//   2. Serve o painel de administração React (pasta admin/dist/)
//   3. Fornece a API que o React usa para gerenciar o conteúdo

// Importa o modulo Express e o modulo Path para lidar com caminhos de arquivos
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const encoder = bodyParser.urlencoded();
const conexao = require('./bd'); // importa o módulo de conexão com o banco de dados MySQL (bd.js)


const app = express();
const PORT = 3000;


// Murilo --------------------------------------------------------
// Importa o módulo de rotas para avisos
const avisosRouter = require('./routes/aviso');
// Permite que o servidor entenda JSON no corpo das requisições
app.use(express.json());
// Middleware para parse de form-data (login)
app.use(bodyParser.urlencoded({ extended: false }));

// Rotas da API - avisos
app.use('/api/avisos', avisosRouter);

    
// Pieto --------------------------------------------------------   
// Configura o Express para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Arquivo estático no Express é qualquer arquivo que não precisa de processamento ou lógica do servidor para ser entregue ao cliente, como imagens, arquivos CSS, JavaScript, HTML, PDFs e outros.

// Rota POST para o login
app.post('/', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;


    // para ver o que está sendo recebido do formulário de login, descomente os console.log abaixo. Eles mostram o valor e o comprimento dos campos username e password, o que pode ajudar a identificar problemas de formatação ou envio dos dados.
    // console.log('Tentativa de login:');
    // console.log('Usuário recebido:', username, '(length:', username.length + ')');
    // console.log('Senha recebida:', password, '(length:', password.length + ')');

    // Consulta o banco de dados com placeholders corretos
    conexao.query('SELECT * FROM login WHERE idLogin = ? AND Senha = ?', [username, password], function(err, result, fields){
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

// Rota para a página inicial (GET)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ROTA DE DEBUG - REMOVER DEPOIS
app.get('/', (req, res) => {
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

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
    console.log('Servidor rodando em http://localhost:' + PORT);
    console.log('Site principal: http://localhost:' + PORT);
    console.log('Painel CMS:    http://localhost:' + PORT + '/admin');
    console.log('API de avisos:  http://localhost:' + PORT + '/api/avisos');
});

// para iniciar apenas use no terminal o comando "npm run dev" e acesse http://localhost:3000 no navegador.