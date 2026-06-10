const Envio = require('../models/enviosModel');

exports.crearNuevoEnvio = async (data, usuario_id) => {
  if (!data.guia) throw new Error('El número de guía es obligatorio.');

  const valor = parseFloat(data.precio || data.valor || 0);

  return await Envio.createWithTransaction({
    guia:        data.guia,
    valor,
    destinatario: data.destinatario || data.destino || null,
    cliente:      data.cliente      || null,
    metodo_pago:  data.metodo_pago  || 'EFECTIVO',
    referencia:   data.referencia   || null,
    cantidad:     data.cantidad     || 1,
    usuario_id,
  });
};

exports.obtenerEnvios = async (filtros = {}) => {
  return await Envio.findAll(filtros);
};