require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conexión a MongoDB Atlas establecida correctamente.');
    } catch (error) {
        console.error('❌ Error fatal: No se pudo conectar a MongoDB.');
        console.error(error.message);
        process.exit(1); // Detiene la app si no hay base de datos
    }
};

// Ejecutar la función de conexión inmediatamente
conectarDB();

module.exports = mongoose.connection;