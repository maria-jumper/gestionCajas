const express = require('express');
const router = express.Router();
const entregaController = require('../controllers/entregasController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, entregaController.registrarEntrega);

module.exports = router;