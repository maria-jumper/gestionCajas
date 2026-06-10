const Gasto = require('../models/gastosModel');

exports.obtenerTodosLosGastos = async (filtros = {}) => {
  return await Gasto.findAll(filtros);
};

exports.crearNuevoGasto = async (data, usuario_id) => {
  if (!data.descripcion || !data.descripcion.trim())
    throw new Error('La descripción del gasto es obligatoria.');
  if (!data.valor || parseFloat(data.valor) <= 0)
    throw new Error('El valor del gasto debe ser mayor a cero.');

  return await Gasto.create({
    descripcion:    data.descripcion.trim(),
    categoria:      data.categoria      || 'otro',
    valor:          parseFloat(data.valor),
    observaciones:  data.observaciones  || null,
    fecha:          data.fecha          || new Date().toISOString().split('T')[0],
    hora:           data.hora           || null,
    registrado_por: data.registrado_por || null,
    usuario_id,
  });
};

exports.eliminarGasto = async (id) => {
  await Gasto.delete(id);
};