const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql'); // Asegúrate de que este sea el driver que usas

module.exports = (pool) => {

    const router = express.Router(); 

    router.get('/valores', async (req, res) => {         
        const request = pool.request();
        const {cod_especificacion,buscar} = req.query;

       let query = `select 
                    v.cod_especificacion,
                    v.cod_valores ,
                    v.valor as valor
                    from valores_especificos v
                    where v.cod_especificacion = @cod_especificacion `;

        request.input('cod_especificacion',sql.Int, `${cod_especificacion}`)
        if(buscar){
            query += " AND v.valor like @buscar";
            request.input('buscar',sql.NVarChar, `%${buscar}%`)
        }
        try {          
             const result = await request.query(query);
            res.json(result.recordset);

        } catch (error) {
            
            console.error('Error durante el proceso:', error);
            res.status(500).json({ message: 'Error Buscando Tipo de Equipo' });
        }
    });
    router.get('/detalleequipo',async(req,res)=>{
        const request = pool.request();
        const {cod_especificacion,cod_equipo} = req.query;
        
        if(!cod_especificacion && !cod_equipo){
            return res.status(400).json({message: 'Error en los datos necesarios para la busqueda'});
        } 
        let query = `select 
            cod_detalle,
            valor
            from detalles_equipos where cod_especificacion = @cod_especificacion and cod_equipo = @cod_equipo`;
        request.input('cod_especificacion',sql.Int,cod_especificacion);
        request.input('cod_equipo',sql.Int,cod_equipo);
        try {          
             const result = await request.query(query);
            res.json(result.recordset);

        } catch (error) {
            
            console.error('Error durante el proceso:', error);
            res.status(500).json({ message: 'Error Buscando Tipo de Equipo' });
        }

    });
    return router; 
};