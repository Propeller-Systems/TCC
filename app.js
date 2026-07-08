// app.js — Servidor principal
// Este arquivo é o "coração" do backend. Ele:
//   1. Serve os arquivos do seu site (pasta public/)
//   2. Serve o painel de administração React (pasta admin/dist/)
//   3. Fornece a API que o React usa para gerenciar o conteúdo

// Importa o modulo Express e o modulo Path para lidar com caminhos de arquivos
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const encoder = bodyParser.urlencoded();
const prisma = require("./prismaClient");
const login = require('./login')
const auth = require('./middleware/auth'); // importa o middleware de autenticação
const router = express.Router();

const app = express();
const PORT = 3000;

// multer para lidar com uploads de arquivos (imagens)
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `foto-${Date.now()}.jpg`);
    }
});
const upload = multer({ storage: storage }); // Configura o destino dos arquivos enviados

app.post('/upload', upload.single('foto'), async (req, res) => {
    try {

        if (!req.session?.usuario?.idusuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Usuário não logado"
            });
        }

        const nomeArquivo = req.file.filename;

        await prisma.usuario.update({
            where: {
                idusuario: req.session.usuario.idusuario
            },
            data: {
                foto: nomeArquivo
            }
        });

        return res.json({
            sucesso: true,
            mensagem: "Foto salva com sucesso!"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao salvar foto"
        });
    }
});

// total de usuarios
router.get("/totalUsuarios", async (req, res) => {
  try {
    const total = await prisma.usuario.count();

    res.json({ total });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao contar usuários" });
  }
});
app.use(router);

// Murilo --------------------------------------------------------
// Importa o módulo de rotas para avisos
const avisosRouter = require('./routes/aviso');
app.use(express.json());
// Middleware para parse de form-data (login)
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'TUVH3lm9', // Chave secreta para assinar a sessão - foi gerada por um gerador de chaves online
    resave: false,
    saveUninitialized: false
}));
// Rotas da API - avisos
app.use('/api/avisos', auth, avisosRouter);

// Pieto --------------------------------------------------------   
// Configura o Express para servir arquivos estáticos da pasta 'public'
app.use('/', login); // Rota para o login

app.get('/home.html', (req, res) => {


    if (!req.session.usuario) {
        return res.redirect('/index.html');
    }
    if (req.session.usuario.usuariocol !== 'admin') {
        return res.send('Acesso negado'); // Redireciona para uma página de acesso dos funcionarios
    }

    res.sendFile(
        path.join(__dirname, 'public', 'home.html')
    );

});

app.use(express.static(path.join(__dirname, 'public'))); // Serve os arquivos estáticos do frontend (HTML, CSS, JS)



// Arquivo estático no Express é qualquer arquivo que não precisa de processamento ou lógica do servidor para ser entregue ao cliente, como imagens, arquivos CSS, JavaScript, HTML, PDFs e outros.

const usuarioRouter = require('./routes/usuario');
app.use('/api/usuarios', auth, usuarioRouter); // Rota para o CRUD de usuários, protegida por autenticação

// Rota para a página inicial (GET)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
    console.log('Servidor rodando em http://localhost:' + PORT);
});

// para iniciar apenas use no terminal o comando "npm run dev" e acesse http://localhost:3000 no navegador.
