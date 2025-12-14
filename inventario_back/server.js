require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); 
const cors = require('cors');


const app = express();
const port = 3000;


const dbConfig = {
    server: process.env.DB_SERVER.split(',')[0], // 'localhost'
    database: process.env.DB_DATABASE, // master
    port: parseInt(process.env.DB_SERVER.split(',')[1], 10), 
    user: process.env.DB_USER, // SA
    password: process.env.DB_PASSWORD, // TU_CONTRASEÑA
   
    options: {

        driver:'tedious',

        encrypt: false, // Siempre true en Linux para TLS y false en local
        trustServerCertificate: true // Requerido en entornos dev sin certificados formales
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let sqlPool;

app.use(express.json());
app.use(cors());

async function conectarBD() {
  try {
      sqlPool = await new sql.ConnectionPool(dbConfig).connect();
      console.log('✅ Conexión exitosa a SQL Server con Pool de conexiones.');
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    process.exit(1);
  }
}

app.get('/', (req, res) => {
  res.send('✅ API corriendo');
});

async function startServer() {
    // 1. Conectar a la base de datos (pool) ANTES de definir o usar las rutas que lo necesitan
    await conectarBD();

    // 2. Ahora que sqlPool está inicializado, podemos importar y pasar el pool a las rutas
    const login = require('./rutas/ruta_login')(sqlPool); 
    const usuario = require('./rutas/ruta_usuarios')(sqlPool); 
    const equipo = require('./rutas/ruta_equipos')(sqlPool); 
    const tipoequipo = require('./rutas/ruta_tipoEquipo')(sqlPool); 
    const especificaciones = require('./rutas/ruta_especificaciones')(sqlPool); 
    const proveedor = require('./rutas/ruta_proveedor')(sqlPool); 
    const asignacion = require('./rutas/ruta_asignaciones')(sqlPool);
    const mantenimineto = require('./rutas/ruta_mantenimientos')(sqlPool);
    
    // 3. Definir tus rutas
    app.get('/', (req, res) => {
        res.send('✅ API corriendo');
    });

    app.use('/api/login', login); 
    app.use('/api/usuarios', usuario); 
    app.use('/api/equipos', equipo); 
    app.use('/api/tipoequipo', tipoequipo); 
    app.use('/api/especificacion', especificaciones); 
    app.use('/api/proveedor', proveedor); 
    app.use('/api/asignacion', asignacion);
    app.use('/api/mantenimientos', mantenimineto);
    

    // 4. Iniciar el servidor Express
    app.listen(port, () => {
        console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
    });
}

// --- Llamar a la función principal para iniciar todo ---
startServer();

// --- Manejo del Cierre de la Aplicación ---
process.on('SIGINT', async () => {
    console.log('Cerrando servidor y pool de conexiones de DB...');
    if (sqlPool) {
        await sqlPool.close();
        console.log('Pool de SQL Server cerrado.');
    }
    process.exit(0);
});