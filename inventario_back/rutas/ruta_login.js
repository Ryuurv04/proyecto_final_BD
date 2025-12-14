// mi-app-bicicletas-backend/routes/authRoutes.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql'); // Asegúrate de que este sea el driver que usas

module.exports = (pool) => {

    const router = express.Router(); 

    router.post('/', async (req, res) => {
        const { usuario, password } = req.body; 

        if (!usuario || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
        }

        try {           
            const request = pool.request();
            request.input('username', sql.VarChar, usuario); 
            
            const result = await request.query(`SELECT 
                u.cod_usuario,
                u.usuario,
                u.contrasena,
                u.nombre,
                u.apellido,
                u.estado,
                sa.nombre AS sub_area,
                a.nombre AS area
                FROM usuario u
                LEFT JOIN sub_area sa ON sa.cod_subarea = u.cod_subarea
                LEFT JOIN area a ON a.cod_area = sa.cod_area
                WHERE u.usuario = @username`); 

            if (result.recordset.length === 0) {
                return res.status(401).json({ message: 'Usuario inválido' });
            }

            const user = result.recordset[0];

            
            const isMatch = await bcrypt.compare(password, user.contrasena);

            if (!isMatch) {
                return res.status(401).json({ message: 'Contraseña Incorrecta' });
            }

            if (user.estado !== 'A') { 
                return res.status(403).json({ message: 'Tu cuenta está inactiva o bloqueada. Contacta al administrador.' });
            }

            const token = jwt.sign(
                { cod_usuario: user.cod_usuario, nombre: user.nombre, usuario: user.usuario }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' } 
            );

            res.status(200).json({
                message: 'Inicio de sesión exitoso.',
                token,
                user: {
                    cod_usuario: user.cod_usuario,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    usuario: user.usuario,
                    area: user.area,
                    sub_area: user.sub_area
                }
            });

        } catch (error) {
            console.error('Error durante el proceso de login:', error);
            res.status(500).json({ message: 'Error durante el proceso de login' });
        }
    });

    return router; 
};