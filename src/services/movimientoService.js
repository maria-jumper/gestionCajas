const Movimiento = require('../models/movimientosModel');

exports.obtenerHistorial = async () => {
    return await Movimiento.findAll();
};

exports.calcularBalanceDiario = async () => {
    // Aquí podríamos agregar lógica extra en el futuro si es necesario
    const balance = await Movimiento.getBalanceDiario();
    return balance;
};