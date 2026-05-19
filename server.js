require('dotenv').config();
const http = require('http'); 
const app = require('./app');
const pool = require('./src/config/db'); // El pool que se conecta a Aiven

const PORT = process.env.PORT || 4000;

// 1. Crea el servidor HTTP usando la app de Express
const httpServer = http.createServer(app); 

// 2. Verificar la conexión a MySQL en Aiven antes de levantar la API
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ ERROR CRÍTICO: No se pudo conectar a la base de datos MySQL en Aiven.");
        console.error("Detalles:", err.message);
        process.exit(1); // Detiene la app si no hay base de datos activa
    }

    console.log("✅ Conectado exitosamente a la Base de Datos MySQL (Aiven)");
    connection.release(); // Libera la conexión de prueba

    // 3. Levantar el servidor HTTP una vez confirmada la base de datos
    const server = httpServer.listen(PORT, () => {
        console.log(`Servidor ejecutándose en modo: ${process.env.NODE_ENV || 'development'}`);
        console.log(`API REST escuchando en el puerto: ${PORT}`);
    });

    // 4. Manejo de cierre limpio del proceso (Ctrl + C o apagado de Render)
    process.on('SIGINT', async () => {
        console.log('\nCerrando servidor de forma limpia...');
        
        // Cerrar el pool de conexiones de MySQL para no dejar hilos muertos
        try {
            await pool.end();
            console.log('💾 Pool de conexiones de MySQL cerrado.');
        } catch (dbErr) {
            console.error('Error al cerrar el pool de MySQL:', dbErr.message);
        }

        // Cerrar el servidor HTTP
        server.close(() => {
            console.log('🛑 Servidor HTTP cerrado. Proceso terminado.');
            process.exit(0);
        });
    });
});