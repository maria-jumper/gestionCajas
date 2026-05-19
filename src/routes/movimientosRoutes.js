const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientosController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, movimientoController.obtenerMovimientos);
router.get('/balance', verifyToken, movimientoController.obtenerBalanceCaja);

module.exports = router;