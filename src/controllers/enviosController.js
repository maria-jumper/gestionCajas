const envioService = require('../services/envioService');

exports.crearEnvio = async (req, res) => {
    try {
        const envioId = await envioService.crearNuevoEnvio(req.body, req.user.id);
        res.status(201).json({ msg: "Envío registrado con éxito", id: envioId });
    } catch (error) {
        // Si el error es de negocio (ej. precio <= 0), devolvemos 400
        res.status(400).json({ error: error.message });
    }
};