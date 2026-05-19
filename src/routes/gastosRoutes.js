const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastosController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, gastoController.obtenerGastos);
router.post('/', verifyToken, gastoController.crearGasto);

module.exports = router;