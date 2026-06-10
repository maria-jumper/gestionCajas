const Inventario = require('../models/inventarioModel');

exports.obtenerTodoElInventario = async (filtros = {}) => {
  return await Inventario.findAll(filtros);
};

exports.buscarPorGuia = async (codigo) => {
  const guia = await Inventario.findByGuia(codigo);
  if (!guia) throw new Error('Guía no encontrada en el inventario.');
  return guia;
};

exports.crearGuia = async (data) => {
  if (!data.guia) throw new Error('El número de guía es obligatorio.');
  return await Inventario.create(data);
};

exports.importarGuias = async (guias) => {
  if (!Array.isArray(guias) || !guias.length)
    throw new Error('Se esperaba un array de guías.');
  return await Inventario.importar(guias);
};

exports.actualizarGuia = async (id, campos) => {
  const afectados = await Inventario.update(id, campos);
  if (afectados === 0) throw new Error('Guía no encontrada.');
  return true;
};

exports.eliminarGuia = async (id) => {
  await Inventario.delete(id);
};