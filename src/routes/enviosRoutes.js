const express = require('express');
const router = express.Router();
const envioController = require('../controllers/enviosController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, envioController.crearEnvio);
// Aquí puedes agregar un router.get('/') si haces un controlador para listar envíos

module.exports = router;