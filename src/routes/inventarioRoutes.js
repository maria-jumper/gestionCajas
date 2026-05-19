const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, inventarioController.obtenerInventario);
router.post('/', verifyToken, inventarioController.crearProducto);
router.put('/:id', verifyToken, inventarioController.actualizarStock);

module.exports = router;