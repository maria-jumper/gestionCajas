require('dotenv').config();
const http = require('http'); 
const mongoose = require('mongoose'); // ✅ CORREGIDO: Importación de mongoose agregada
const app = require('./app');
const cors = require('cors');

// Si './src/config/db' maneja MySQL y ya no lo usas, borra o comenta esta línea:
// const pool = require('./src/config/db'); 

const PORT = process.env.PORT || 4000;

// Nota: Normalmente cors() se asocia dentro de 'app.js', pero si lo dejas aquí funciona:
app.use(cors());

// Crea el servidor HTTP usando la app de Express
const httpServer = http.createServer(app); 

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// Arrancar el servidor
const server = httpServer.listen(PORT, () => {
  // ✅ CORREGIDO: Cambiado a comillas invertidas (backticks) para que lea las variables
  console.log(`Servidor运行 ejecutándose en modo ${process.env.NODE_ENV}`);
  console.log(`API REST escuchando en http://localhost:${PORT}`);
});

// Apagado limpio del servidor
process.on('SIGINT', async () => {
    console.log('Cerrando servidor....');
    
    // Si quitaste MySQL, comenta o borra el pool.end():
    // await pool.end(); 
    
    server.close(() => {
        console.log('Proceso terminado.');
        process.exit(0);
    });
});
