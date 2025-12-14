const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql'); // Asegúrate de que este sea el driver que usas

module.exports = (pool) => {

    const router = express.Router(); 
    // EQUIPOS
    //busca a los equipos 
    router.get('/', async (req, res) => {  
        const {buscar,cod_proveedor} = req.query;       
        const request = pool.request();

       let query = `select 
            p.cod_proveedor,
            p.nombre,
            p.correo,
            p.telefono
            from proveedor p`;

        if(buscar){
            query +=' Where p.nombre like @proveedor '
            request.input('proveedor',sql.NVarChar,`%${buscar}%`);
        }
        if(cod_proveedor){
            query +=' Where p.cod_proveedor = @cod_proveedor '
            request.input('cod_proveedor',sql.Int,`${cod_proveedor}`);
        }

        try {          
             const result = await request.query(query);
            res.json(result.recordset);

        } catch (error) {
            
            console.error('Error durante el proceso:', error);
            res.status(500).json({ message: 'Error Buscando el Proveedor' });
        }
    });

    return router; 
};