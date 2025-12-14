// mi-app-bicicletas-backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// El JWT_SECRET se carga desde process.env que dotenv.config() en server.js ya habrá populado.
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'No se proporcionó token de autenticación.' });
    }

    const token = authHeader.split(' ')[1]; // Extrae el token de "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // ¡Esto es crucial! Aquí se establece req.user
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado. Por favor, inicia sesión nuevamente.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido o malformado.' });
        }
        console.error('Error de autenticación:', error);
        res.status(500).json({ message: 'Error interno del servidor al autenticar.' });
    }
};

const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        // Asume que authMiddleware ya se ejecutó y req.user está disponible
        if (!req.user || !req.user.cod_rol) {
            return res.status(403).json({ message: 'Acceso denegado: Rol de usuario no disponible.' });
        }

        if (!allowedRoles.includes(req.user.cod_rol)) {
            return res.status(403).json({ message: 'Acceso denegado: No tienes el rol necesario para esta acción.' });
        }

        next();
    };
};

module.exports = { authMiddleware, authorizeRoles };