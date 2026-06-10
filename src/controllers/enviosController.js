const envioService = require('../services/envioService');

exports.crearEnvio = async (req, res) => {
  try {
    const id = await envioService.crearNuevoEnvio(req.body, req.user.id);
    res.status(201).json({ msg: 'Envío registrado con éxito', id });
  } catch (error) {
    console.error('Error crearEnvio:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerEnvios = async (req, res) => {
  try {
    const envios = await envioService.obtenerEnvios(req.query);
    res.json(envios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};