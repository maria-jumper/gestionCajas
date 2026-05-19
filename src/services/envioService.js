const Envio = require('../models/enviosModel');

exports.crearNuevoEnvio = async (data, usuario_id) => {
    // Aquí puedes poner validaciones de negocio. 
    // Por ejemplo: ¿El precio es mayor a cero?
    if (data.precio <= 0) {
        throw new Error('El precio del envío debe ser mayor a cero.');
    }

    // Llamamos al modelo que tiene la transacción
    const envioId = await Envio.createWithTransaction({
        guia: data.guia,
        precio: data.precio,
        destino: data.destino,
        usuario_id: usuario_id
    });

    return envioId;
};