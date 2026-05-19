const Entrega = require('../models/entregasModel');
const Inventario = require('../models/inventarioModel'); // Opcional, si quieres validar stock aquí

exports.registrarEntregaCaja = async (data, usuario_id) => {
    // 1. Validaciones de negocio
    if (!data.productos || data.productos.length === 0) {
        throw new Error('No se pueden registrar entregas sin productos.');
    }

    if (!['EFECTIVO', 'TRANSFERENCIA'].includes(data.metodo_pago)) {
        throw new Error('Método de pago no válido.');
    }

    // Opcional: Podrías consultar el modelo de inventario para ver si hay stock suficiente ANTES de intentar vender.
    // ...

    // 2. Ejecutar la transacción en el modelo
    const entregaId = await Entrega.createWithTransaction({
        guia: data.guia,
        precio: data.precio,
        metodo_pago: data.metodo_pago,
        productos: data.productos,
        usuario_id: usuario_id
    });

    return entregaId;
};