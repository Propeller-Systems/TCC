function auth(req, res, next) {
    console.log(req.session);
        console.log(req.session?.usuario);
                console.log(req.session?req.session.usuario:null);



    if (req.session && req.session.usuario) {
        // O usuário está autenticado, continue para a próxima função de middleware ou rota
        next();
    } else {
        // Se for uma chamada para a API (fetch/XHR) retorne 401 em JSON
        const wantsJson = req.originalUrl && req.originalUrl.startsWith('/api');
        const acceptsJson = req.headers && req.headers.accept && req.headers.accept.indexOf('application/json') !== -1;

        if (wantsJson || req.xhr || acceptsJson) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        // Caso contrário, redirecione para a página de login
        res.redirect('/login');
    } 
}

module.exports = auth;