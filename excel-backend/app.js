require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const excelRoutes = require('./routes/excelRoutes');

const app = express();

// Middlewares (DEBEN IR PRIMERO)
app.use(cors({
    origin: [
        'https://dashboard.jaison.mx',
        'http://localhost:3000' // Opcional para desarrollo
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB con mejor manejo de errores
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ Conectado a MongoDB Atlas - BD:', mongoose.connection.name))
    .catch(err => {
        console.error('❌ Error de conexión a MongoDB:', err.message);
        process.exit(1);
    });

// Debug de conexión a MongoDB
mongoose.connection.on('error', err => {
    console.error('❌ Error en tiempo real de MongoDB:', err);
});

// Rutas API (ANTES de las estáticas)
app.use('/api/excel', excelRoutes);

// Ruta de prueba
app.get('/api/status', (req, res) => {
    res.json({
        status: 'OK',
        db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Configuración para producción (solo si existe la carpeta build)
// Configuración para producción
if (process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, 'app1', 'build')));

    app.get(/^\/(?!api).*/, (req, res) => { // Excluye rutas /api
        res.sendFile(path.join(__dirname, 'app1', 'build', 'index.html'));
    });
}

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔗 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  URI MongoDB: ${process.env.MONGODB_URI?.split('@')[1]?.split('/')[0] || 'No configurada'}`);
});


// Headers de seguridad
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});