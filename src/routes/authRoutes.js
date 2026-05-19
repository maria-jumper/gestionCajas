const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// Cualquier usuario puede loguearse (no requiere token ni rol)
router.post('/login', authController.login);

// SOLO el administrador puede crear nuevos usuarios
router.post('/register', verifyToken, checkRole('admin'), authController.register);

// Si tuvieras un endpoint para ver estadísticas que admin y secretaria pueden ver:
// router.get('/stats', verifyToken, checkRole(['admin', 'secretaria']), tuController.stats);

module.exports = router;