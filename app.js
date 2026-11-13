
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

const prisma = require("./prismaClient");
const login = require("./login");
const auth = require("./middleware/auth");
const admin = require("./middleware/admin");

const avisosRouter = require("./routes/aviso");
const usuarioRouter = require("./routes/usuario");
const documentoRouter = require("./routes/doc");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET || "TUVH3lm9",
    resave: false,
    saveUninitialized: false
}));

app.use("/", login);

app.use("/api/avisos", auth, admin, avisosRouter);
app.use("/api/usuarios", auth, admin, usuarioRouter);
app.use("/api/doc", auth, admin, documentoRouter);

app.get("/totalUsuarios", auth, admin, async (req, res) => {
    try {
        const total = await prisma.usuario.count();
        res.json({ total });
    } catch (error) {
        console.error("Erro ao contar usuários:", error);
        res.status(500).json({
            error: "Erro ao contar usuários"
        });
    }
});

app.use((req, res, next) => {
    const PaginaHTML = path.extname(req.path).toLowerCase() === ".html";
    const PaginaLogin = req.path === "/index.html";

    if (!PaginaHTML || PaginaLogin) {
        return next();
    }
    return admin(req, res, next);
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
