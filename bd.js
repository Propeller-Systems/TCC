// Importa o módulo de conexão com o banco de dados (MySQL)
const mysql = require('mysql2');

//configura a conexão com o banco de dados MySQL
// const conexao = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '123321',
//     database: 'gerenciamento_escolar'
// });

// conexao.connect((err) => {
//     if (err) {
//         console.error('Erro ao conectar ao banco de dados:', err);
//         return;
//     }
//     console.log('Conexão com o banco de dados estabelecida.');
// });

// module.exports = conexao; // exporta a conexão para ser usada em outros arquivos (como rotas/aviso.js)