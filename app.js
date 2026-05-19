const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Cargar variables de entorno al inicio
require('dotenv').config();

// ── Importación de Rutas ──────────────────────────────────────────────────────
const authRoutes = require('./src/routes/authRoutes'); 
const usuariosRoutes = require('./src/routes/usuariosRoutes'); 
const inventarioRoutes = require('./src/routes/inventarioRoutes');
const envioRoutes = require('./src/routes/enviosRoutes');
const entregaRoutes = require('./src/routes/entregasRoutes');
const gastoRoutes = require('./src/routes/gastosRoutes');
const movimientoRoutes = require('./src/routes/movimientosRoutes');

// Importación del Middleware global de errores
const { errorHandler } = require('./src/middlewares/errorMiddleware');

const app = express();

// ── Middlewares Base y Seguridad ──────────────────────────────────────────────
app.use(helmet());       // Protege la app configurando varios headers HTTP
app.use(cors());         // Permite que tu frontend se comunique con el backend
app.use(morgan('dev'));   // Muestra las peticiones HTTP en la consola (GET, POST, etc.)
app.use(express.json()); // Permite al servidor entender formatos JSON en los bodies

// ── Registro de Rutas de la API ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes); 
app.use('/api/entregas', entregaRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/envios', envioRoutes);
app.use('/api/inventario', inventarioRoutes);

// ── Manejo Global de Errores ──────────────────────────────────────────────────
// (Debe ir estrictamente al final de todas las rutas)
app.use(errorHandler);

module.exports = app;