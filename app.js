// Importa o modulo Express e o modulo Path para lidar com caminhos de arquivos
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Configura o Express para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));
// Arquivo estático no Express é qualquer arquivo
//  que não precisa de processamento ou lógica do 
// servidor para ser entregue ao cliente, como imagens, 
// arquivos CSS, JavaScript, HTML, PDFs e outros.

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// para iniciar apenas use no terminal o comando "node app.js" e acesse http://localhost:3000 no navegador.