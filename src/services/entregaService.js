const Entrega = require('../models/entregasModel');

exports.registrarEntregaCaja = async (data, usuario_id) => {
  if (!data.guia)        throw new Error('El número de guía es obligatorio.');
  if (!data.metodo_pago) throw new Error('El método de pago es obligatorio.');

  return await Entrega.createWithTransaction({
    guia:          data.guia,
    valor:         data.precio || data.valor || 0,
    metodo_pago:   data.metodo_pago,
    referencia:    data.referencia    || null,
    id_inventario: data.id_inventario || null,
    cliente:       data.cliente       || null,
    usuario_id,
  });
};

exports.obtenerEntregas = async (filtros = {}) => {
  return await Entrega.findAll(filtros);
};