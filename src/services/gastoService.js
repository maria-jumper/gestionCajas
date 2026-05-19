const Gasto = require('../models/gastosModel');

exports.obtenerTodosLosGastos = async () => {
    return await Gasto.findAll();
};

exports.crearNuevoGasto = async (data, usuario_id) => {
    // Validaciones de negocio
    if (!data.descripcion || data.descripcion.trim() === '') {
        throw new Error('La descripción del gasto es obligatoria.');
    }
    
    if (data.valor <= 0) {
        throw new Error('El valor del gasto debe ser mayor a cero.');
    }

    const gastoId = await Gasto.create({
        descripcion: data.descripcion,
        valor: data.valor,
        usuario_id: usuario_id
    });

    return gastoId;
};