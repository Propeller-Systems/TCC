function admin(req, res, next) {
    // verifica nivel
    if(req.session.usuario.usuariocol !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
}

module.exports = admin;