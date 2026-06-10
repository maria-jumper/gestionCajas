const entregaService = require('../services/entregaService');

exports.registrarEntrega = async (req, res) => {
  try {
    const id = await entregaService.registrarEntregaCaja(req.body, req.user.id);
    res.status(201).json({ msg: 'Entrega registrada exitosamente', id });
  } catch (error) {
    console.error('Error registrarEntrega:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerEntregas = async (req, res) => {
  try {
    const entregas = await entregaService.obtenerEntregas(req.query);
    res.json(entregas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};