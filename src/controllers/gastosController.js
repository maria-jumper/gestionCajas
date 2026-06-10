const gastoService = require('../services/gastoService');

exports.obtenerGastos = async (req, res) => {
  try {
    const gastos = await gastoService.obtenerTodosLosGastos(req.query);
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.crearGasto = async (req, res) => {
  try {
    const id = await gastoService.crearNuevoGasto(req.body, req.user.id);
    res.status(201).json({ id, msg: 'Gasto registrado con éxito' });
  } catch (error) {
    console.error('Error crearGasto:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.eliminarGasto = async (req, res) => {
  try {
    await gastoService.eliminarGasto(req.params.id);
    res.json({ msg: 'Gasto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};