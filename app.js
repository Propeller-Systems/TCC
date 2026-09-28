const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const encoder = bodyParser.urlencoded();
const prisma = require("./prismaClient");
const login = require('./login');
const auth = require('./middleware/auth');
const router = express.Router();

const app = express();
const PORT = 3000;

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

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'TUVH3lm9', 
    resave: false,
    saveUninitialized: false
}));
const avisosRouter = require('./routes/aviso');
app.use('/api/avisos', auth, avisosRouter);

const usuarioRouter = require('./routes/usuario');
app.use('/api/usuarios', auth, usuarioRouter);

const documentoRouter = require('./routes/doc');
app.use('/api/doc', auth, documentoRouter);

app.use('/', login); 

app.get('/home.html', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/index.html');
    }
    if (req.session.usuario.usuariocol !== 'admin') {
        return res.send('Acesso negado');
    }
    res.sendFile(
        path.join(__dirname, 'public', 'home.html')
    );
});
app.use(express.static(path.join(__dirname, 'public')));



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log('Servidor rodando em http://localhost:' + PORT);
});

