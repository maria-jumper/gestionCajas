require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const conectarDB = async () => {
    try {
        // Usamos directamente la URI completa que ya tiene el usuario y contraseña correctos
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conexión a MongoDB Atlas establecida correctamente.');
    } catch (error) {
        console.error('❌ Error fatal: No se pudo conectar a MongoDB.');
        console.error(error.message);
        process.exit(1);
    }
};

conectarDB();

module.exports = mongoose.connection;