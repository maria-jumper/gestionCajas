const movimientoService = require('../services/movimientoService');

exports.obtenerMovimientos = async (req, res, next) => {
    try {
        const movimientos = await movimientoService.obtenerHistorial();
        res.json(movimientos);
    } catch (error) {
        next(error);
    }
};

exports.obtenerBalanceCaja = async (req, res, next) => {
    try {
        const balance = await movimientoService.calcularBalanceDiario();
        res.json(balance);
    } catch (error) {
        next(error);
    }
};