const entregaService = require('../services/entregaService');

exports.registrarEntrega = async (req, res) => {
    try {
        const entregaId = await entregaService.registrarEntregaCaja(req.body, req.user.id);
        res.status(201).json({ msg: "Entrega registrada exitosamente", id: entregaId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};