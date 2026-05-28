function auth(req, res, next) {

    if (req.session && req.session.usuario) {
        // O usuário está autenticado, continue para a próxima função de middleware ou rota
        next();
    } else {
        // O usuário não está autenticado, redirecione para a página de login
        res.redirect('/login');
    } 
}

module.exports = auth;