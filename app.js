// app.js — Servidor principal
// Este arquivo é o "coração" do backend. Ele:
//   1. Serve os arquivos do seu site (pasta public/)
//   2. Serve o painel de administração React (pasta admin/dist/)
//   3. Fornece a API que o React usa para gerenciar o conteúdo

// Importa o modulo Express e o modulo Path para lidar com caminhos de arquivos
const express = require('express');
const path = require('path');

// Importa o módulo de conexão com o banco de dados (MySQL)
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

//configura a conexão com o banco de dados MySQL
const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123321',
    database: 'gerenciamento_escolar'
});

//teste de conexao
// conexao.connect((err) => {
//     if (err) {
//         console.error('Erro ao conectar ao banco de dados:', err);
//         return;
//     }
//     console.log('Conexão com o banco de dados estabelecida.');
// });


// Murilo --------------------------------------------------------
// Importa o módulo de rotas para avisos
const avisosRouter = require('./routes/aviso');
// Permite que o servidor entenda JSON no corpo das requisições
app.use(express.json());

// Permite que o React se comunique com este servidor (CORS)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Rotas da API - avisos
app.use('/api/avisos', avisosRouter);

// Servir o painel de administração (React compilado)
app.use('/admin', express.static(path.join(__dirname, 'admin/dist')));
app.get('/admin/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
});
    
// Pieto --------------------------------------------------------   
// Configura o Express para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Arquivo estático no Express é qualquer arquivo que não precisa de processamento ou lógica do servidor para ser entregue ao cliente, como imagens, arquivos CSS, JavaScript, HTML, PDFs e outros.

app.get('/', function(req, res) {
    conexao.query('SELECT * FROM login', function(err, result, fields){
        if (result.length > 0)  {
            res.redirect('/Gestao.html');
        }else {
            res.redirect('/');
        }
});
});

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
     console.log('✅ Servidor rodando em http://localhost:' + PORT);
    console.log('📝 Site principal: http://localhost:' + PORT);
    console.log('⚙️  Painel CMS:    http://localhost:' + PORT + '/admin');
    console.log('🔌 API de avisos:  http://localhost:' + PORT + '/api/avisos');
});

// para iniciar apenas use no terminal o comando "npm run dev" e acesse http://localhost:3000 no navegador.