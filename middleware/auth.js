function auth(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    }

    const wantsJson =
        req.originalUrl.startsWith("/api") ||
        req.xhr ||
        (req.headers.accept || "").includes("application/json");

    if (wantsJson) {
        return res.status(401).json({
            error: "Não autenticado"
        });
    }

    return res.redirect("/login");
}

module.exports = auth;
