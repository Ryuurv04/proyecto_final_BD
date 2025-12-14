const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql'); // Asegúrate de que este sea el driver que usas

module.exports = (pool) => {

    const router = express.Router(); 

    router.get('/', async (req, res) => {         
        const request = pool.request();
        let {pag =1,limite =5,busqueda='' } = req.query
        //let {fecha} = req.body
        let fecha
        pag = parseInt(pag);
        limite = parseInt(limite);
        const offset = (pag - 1) * limite;
        try {  

            if(!fecha){
                const fechaActual = new Date();
                const soloFecha = fechaActual.toISOString().substring(0, 10);
                fecha = soloFecha;
            }

            let whereInfo = `where COALESCE(ultimo_mantenimiento, '1900-01-01') <= CONVERT(DATE, @fecha) `;
            request.input('fecha', sql.Date,`%${fecha}%`);

            if(busqueda){
                whereInfo +=` and (e.marbete LIKE @buscar OR e.serie LIKE @buscar OR te.nombre like @buscar) `
                request.input('buscar', sql.VarChar,`%${busqueda}%`);
            }

             const countQuery = `
                SELECT COUNT(*) AS total
                FROM equipos e
                left join tipoequipo te on te.cod_tipo_equipo = e.cod_tipo_equipo
                left join asignaciones a on a.cod_equipo = e.cod_equipo and a.estado = 'A'
                left join usuario u on u.cod_usuario = a.cod_usuario
                left join sub_area sa on sa.cod_subarea = u.cod_subarea
                ${whereInfo}`
            ;

            const countResult = await request.query(countQuery);
            const total = countResult.recordset[0].total;

       let query = `select 
            e.cod_equipo,
            te.cod_tipo_equipo as 'tipo',
            te.nombre as 'tipo_equipo',
            e.marbete,e.serie,
            COALESCE(CONVERT(NVARCHAR, e.ultimo_mantenimiento, 103), N'N/A') as 'ultimo_mantenimiento',
            COALESCE(                
                sa.nombre,                 
                N'TIC'
            ) AS 'ubicacion_actual'
            from equipos e
            left join tipoequipo te on te.cod_tipo_equipo = e.cod_tipo_equipo
            left join asignaciones a on a.cod_equipo = e.cod_equipo and a.estado = 'A'
            left join usuario u on u.cod_usuario = a.cod_usuario
            left join sub_area sa on sa.cod_subarea = u.cod_subarea
            ${whereInfo}
            ORDER BY cod_equipo  
            OFFSET @offset  ROWS
            FETCH NEXT @limite ROWS ONLY `;

        request.input('offset',sql.Int,offset);
        request.input('limite',sql.Int, limite);
               
            const result = await request.query(query);
             const rows = result.recordset;
            
            res.json({
            data: rows,
            total,
            page: pag,
            totalPages: Math.ceil(total / limite)
        });

        } catch (error) {
            
            console.error('Error durante el proceso:', error);
            res.status(500).json({ message: 'No se pudieron cargar los productos. Inténtalo de nuevo.' });
        }
    });
    router.get('/listamantenimiento', async (req, res) => {

        const request = pool.request(); 
       let query = `select 
                cod_trabajo,
                descripcion
                from trabajo_mantenimiento`;
        try {          
            const result = await request.query(query);
            res.json(result.recordset);

        } catch (error) {
            
            console.error('Error durante el proceso:', error);
            res.status(500).json({ message: 'Error Buscando al Usuario' });
        }
    });

    

    return router; 
};