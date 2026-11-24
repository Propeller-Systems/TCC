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
const atestadoRouter = require("./routes/atestado");
const { error } = require("console");

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

app.use("/api/avisos", auth, avisosRouter);
app.use("/api/usuarios", auth, admin, usuarioRouter);
app.use("/api/doc", auth, documentoRouter);
app.use("/api/atestados", auth, atestadoRouter);
app.get("/api/sessao", auth, (req, res) => {
    res.json({
        usuariocol: req.session.usuario.usuariocol
    });
});

// Dashboard - HOME - Parte onde mostra os dados dos usuarios 
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

app.get("/usuarioAtivo", auth, admin, async (req, res) => {
    try {
        const ativos = await prisma.usuario.count({
            where: { estado: 1 }
        });
        return res.status(200).json({ ativos });
    } catch (error) {
        console.error('Erro ao contar usuarios ativos: ', error);
        return res.status(500).json("Erro ao buscar usuarios ativos")
    }
})

app.get("/novasContratacoes", auth, admin, async (req, res) => {
    try {
        const limite = new Date();
        limite.setDate(limite.getDate() - 21);

        const novas = await prisma.usuario.count({
            where: {
                usuariocol: "funcionario",
                dataCriacao: {
                    gte: limite
                }
            }
        });

        return res.status(200).json({ novas });

    } catch (error) {
        console.error("Erro ao buscar novas contratações:", error);

        return res.status(500).json({
            error: "Erro ao buscar novas contratações"
        });
    }
});

app.get("/api/notificacoes", auth, async (req, res) => {
    try {
        const usuario = req.session.usuario;
        const idusuario = Number(usuario.idusuario);

        let whereAvisos = {};

        if (usuario.usuariocol !== "admin") {
            whereAvisos = {
                OR: [
                    { escopo: "geral" },
                    {
                        escopo: "funcionario",
                        aviso_destinatario: { none: {} }
                    },
                    {
                        escopo: "funcionario",
                        aviso_destinatario: {
                            some: { idusuario }
                        }
                    }
                ]
            };
        }

        const [avisos, documentos] = await Promise.all([
            prisma.aviso.findMany({
                where: whereAvisos,
                include: {
                    aviso_destinatario: {
                        include: {
                            usuario: {
                                select: { idusuario: true, nome: true }
                            }
                        }
                    }
                },
                orderBy: { idaviso: "desc" },
                take: 10
            }),
            prisma.documento.findMany({
                orderBy: { iddocumento: "desc" },
                take: 10
            })
        ]);

        const avisosFormatados = avisos.map((aviso) => {
            const destinatarios = aviso.aviso_destinatario || [];
            const dirigidoAoUsuario =
                aviso.escopo === "geral"
                    ? false
                    : destinatarios.some((destinatario) => destinatario.idusuario === idusuario);

            let tag = "para todos";
            let tagTipo = "general";

            if (usuario.usuariocol === "admin") {
                if (aviso.escopo === "funcionario" && destinatarios.length > 0) {
                    tag = destinatarios
                        .map((destinatario) => destinatario.usuario?.nome)
                        .filter(Boolean)
                        .join(", ");
                    tagTipo = "recipient";
                }
            } else if (dirigidoAoUsuario) {
                tag = "para você";
                tagTipo = "personal";
            }

            return {
                tipo: "aviso",
                id: aviso.idaviso,
                titulo: aviso.titulo,
                texto: aviso.conteudo,
                data: aviso.date,
                tag,
                tagTipo
            };
        });

        const documentosFormatados = documentos.map((documento) => ({
            tipo: "documento",
            id: documento.iddocumento,
            titulo: documento.titulo,
            texto: documento.texto,
            data: null,
            caminho: documento.caminho,
            tag: "para todos",
            tagTipo: "general"
        }));

        res.json([...avisosFormatados, ...documentosFormatados]);
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        res.status(500).json({ error: "Erro ao buscar notificações." });
    }
});

app.use((req, res, next) => {
    const paginaHTML = path.extname(req.path).toLowerCase() === ".html";
    const paginaLogin = req.path === "/index.html";

    if (!paginaHTML || paginaLogin) {
        return next();
    }

    if (!req.session || !req.session.usuario) {
        return auth(req, res, next);
    }
    const usuario = req.session.usuario;
    const paginasAdmin = [
        "/home.html",
        "/usuarios.html"
    ];

    if (
        usuario.usuariocol === "funcionario" &&
        paginasAdmin.includes(req.path)
    ) {
        return res.status(403).send("Acesso negado.");
    }
    return next();
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
