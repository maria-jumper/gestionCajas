const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

require('dotenv').config();

const authRoutes       = require('./src/routes/authRoutes');
const usuariosRoutes   = require('./src/routes/usuariosRoutes');
const inventarioRoutes = require('./src/routes/inventarioRoutes');
const envioRoutes      = require('./src/routes/enviosRoutes');
const entregaRoutes    = require('./src/routes/entregasRoutes');
const gastosRoutes     = require('./src/routes/gastosRoutes');
const movimientoRoutes = require('./src/routes/movimientosRoutes');
const informesRoutes   = require('./src/routes/informesRoutes');

const { errorHandler } = require('./src/middlewares/errorMiddleware');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
// ← el express.json() duplicado se eliminó

app.use('/api/auth',        authRoutes);
app.use('/api/usuarios',    usuariosRoutes);
app.use('/api/entregas',    entregaRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/gastos',      gastosRoutes);
app.use('/api/envios',      envioRoutes);
app.use('/api/inventario',  inventarioRoutes);
app.use('/api/informes',    informesRoutes);

app.use(errorHandler);

module.exports = app;