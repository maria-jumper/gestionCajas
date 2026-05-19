const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose'); // Queda una sola importación limpia

// Rutas
const authRoutes = require('./src/routes/authRoutes'); 
const inventarioRoutes = require('./src/routes/inventarioRoutes');
const envioRoutes = require('./src/routes/enviosRoutes');
const entregaRoutes = require('./src/routes/entregasRoutes');
const gastoRoutes = require('./src/routes/gastosRoutes');
const movimientoRoutes = require('./src/routes/movimientosRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes'); 

const app = express();

// Seguridad HTTP headers
app.use(helmet());

// Logs de peticiones en consola
app.use(morgan('dev'));

// Middlewares base
app.use(cors());
app.use(express.json());

// Logs de control para desarrollo
console.log('authRoutes:', authRoutes);
console.log('inventarioRoutes:', inventarioRoutes);

// Definición de Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes); 
app.use('/api/entregas', entregaRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/envios', envioRoutes);
app.use('/api/inventario', inventarioRoutes);

// Middleware global de errores
const { errorHandler } = require('./src/middlewares/errorMiddleware');
console.log('errorHandler:', errorHandler);
app.use(errorHandler);

module.exports = app;