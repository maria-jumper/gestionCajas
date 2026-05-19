require('dotenv').config();
const http = require('http'); // <--- 1. Importa el módulo nativo
const app = require('./app');
const cors = require('cors');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 4000;
app.use(cors());
// 2. Crea el servidor HTTP usando la app de Express
const httpServer = http.createServer(app); 

// 3. Ahora sí, httpServer ya está definido
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión:", err))
const server = httpServer.listen(PORT, () => {
  console.log('Servidor ejecutándose en modo ${process.env.NODE_ENV}');
  console.log('API REST escuchando en http://localhost:${PORT}');
});

process.on('SIGINT', async () => {
    console.log('Cerrando servidor....');
    await pool.end();
    server.close(() => {
        console.log('Proceso terminado.');
        process.exit(0);
    });
});