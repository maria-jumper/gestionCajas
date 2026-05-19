const authService = require('../services/authService');

exports.register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({ msg: "Usuario registrado", id: result });
    } catch (error) {
        // Pasamos el error al errorMiddleware
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};