const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const prisma = require('./prismaClient');
const login = require('./login');
const auth = require('./middleware/auth');

const avisosRouter = require('./routes/aviso');
const usuarioRouter = require('./routes/usuario');
const documentoRouter = require('./routes/doc');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(session({
    secret: 'TUVH3lm9',
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(
    path.join(__dirname, 'public')
));

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

app.use('/', login);
app.use('/api/avisos', auth, avisosRouter);
app.use('/api/usuarios', auth, usuarioRouter);
app.use('/api/doc', auth, documentoRouter);

app.get('/totalUsuarios', async (req, res) => {
    try {
        const total = await prisma.usuario.count();
        res.json({
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Erro ao contar usuários'
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'index.html')
    );
});

app.listen(PORT, () => {

    console.log(
        'Servidor rodando em http://localhost:' + PORT
    );

});

