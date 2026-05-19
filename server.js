require('dotenv').config();
const http = require('http'); 
const mongoose = require('mongoose'); 
const app = require('./app');
const cors = require('cors');

const PORT = process.env.PORT || 4000;

app.use(cors());

// Crea el servidor HTTP usando la app de Express
const httpServer = http.createServer(app); 

// ── CONEXIÓN SEGURA A MONGODB ATLAS ──────────────────────────────────────────
console.log("Intentando conectar a MongoDB Atlas...");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado exitosamente a MongoDB Atlas");
    
    // SÓLO arrancamos el servidor HTTP si la base de datos se conectó con éxito
    const server = httpServer.listen(PORT, () => {
      console.log(`Servidor ejecutándose en modo ${process.env.NODE_ENV || 'production'}`);
      console.log(`API REST escuchando en el puerto: ${PORT}`);
    });

    // Apagado limpio del servidor (Movemos el SIGINT aquí adentro)
    process.on('SIGINT', () => {
        console.log('Cerrando servidor de forma limpia...');
        server.close(() => {
            console.log('Proceso terminado.');
            process.exit(0);
        });
    });
  })
  .catch((err) => {
    // Si la contraseña o la URI están mal, aquí detendremos el despliegue con claridad
    console.error("❌ ERROR CRÍTICO: No se pudo conectar a MongoDB.");
    console.error("Detalles del fallo:", err.message);
    console.error("👉 Revisa que tu contraseña en las variables de Render no tenga caracteres especiales y que la IP universal (0.0.0.0/0) esté activa en Atlas.");
    
    // Forzamos a Node a cerrarse. Render detectará el fallo de inmediato sin engañar al sistema
    process.exit(1); 
  });