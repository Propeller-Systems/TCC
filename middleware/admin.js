function admin(req, res, next) {
    if (!req.session || !req.session.usuario) {
        const wantsJson =
            req.originalUrl.startsWith("/api") ||
            req.xhr ||
            (req.headers.accept || "").includes("application/json");

        if (wantsJson) {
            return res.status(401).json({
                error: "Não autenticado"
            });
        }
        return res.redirect("/");
    }

    if (req.session.usuario.usuariocol !== "admin") {
        return res.status(403).send("Acesso negado: somente administradores.");
    }
    return next();
}

module.exports = admin;
