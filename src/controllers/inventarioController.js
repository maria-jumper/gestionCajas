const inventarioService = require('../services/inventarioService');

exports.obtenerInventario = async (req, res) => {
  try {
    const items = await inventarioService.obtenerTodoElInventario(req.query);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buscarPorGuia = async (req, res) => {
  try {
    const guia = await inventarioService.buscarPorGuia(req.params.codigo);
    res.json(guia);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.crearGuia = async (req, res) => {
  try {
    const id = await inventarioService.crearGuia(req.body);
    res.status(201).json({ id, msg: 'Guía creada' });
  } catch (error) {
    const status = error.message.includes('ya existe') ? 409 : 400;
    res.status(status).json({ error: error.message });
  }
};

exports.importarGuias = async (req, res) => {
  try {
    const resultado = await inventarioService.importarGuias(req.body);
    res.json({ msg: 'Importación completada', ...resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.actualizarGuia = async (req, res) => {
  try {
    await inventarioService.actualizarGuia(req.params.id, req.body);
    res.json({ msg: 'Guía actualizada correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.eliminarGuia = async (req, res) => {
  try {
    await inventarioService.eliminarGuia(req.params.id);
    res.json({ msg: 'Guía eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};