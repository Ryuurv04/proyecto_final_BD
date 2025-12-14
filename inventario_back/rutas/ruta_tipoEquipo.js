const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql'); // Asegúrate de que este sea el driver que usas

module.exports = (pool) => {

    const router = express.Router(); 
    // EQUIPOS
    //busca a los equipos 
    router.get('/', async (req, res) => {         
        const request = pool.request();

       let query = `select 
            te.cod_tipo_equipo as cod_tipoequipo,
            te.nombre as tipoequipo
            from tipoequipo te`;

        try {          
             const result = await request.query(query);
            res.json(result.recordset);

        } catch (error) {
            
            console.error('Error durante el proceso:', error);
            res.status(500).json({ message: 'Error Buscando Tipo de Equipo' });
        }
    });
    router.get('/:cod_tipo_equipo/espesificaciones', async (req, res) => {      
        const { cod_tipo_equipo } = req.params;  
        if(!cod_tipo_equipo){
            return res.status(400).json({message: 'El tipo de equipo es Obligatorio'});
        }
        try {
            const request = pool.request();
            request.input('cod_tipo_equipo',sql.Int,cod_tipo_equipo);
            const query = "select cod_especificacion,nombre  from especificaciones where cod_tipo_equipo = @cod_tipo_equipo"
            
            const resultado = await request.query(query);
            res.json(resultado.recordset);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    });
    return router; 
};