const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql'); // Asegúrate de que este sea el driver que usas

module.exports = (pool) => {

    const router = express.Router(); 

    router.get('/', async (req, res) => {         
            const request = pool.request();
            let {pag =1,limite =5,cod_usuario=0,cod_subarea=0,marbete ='',usuario_asigno = 0, fecha1 = '',fecha2=''} = req.query
            pag = parseInt(pag);
            limite = parseInt(limite);
            cod_usuario= parseInt(cod_usuario)
            usuario_asigno= parseInt(usuario_asigno)
            cod_subarea= parseInt(cod_subarea)
            const offset = (pag - 1) * limite;
            try {  
                let whereInfo = ` where a.estado = 'A' `;
    
                if(cod_usuario){
                    whereInfo +=` AND u.cod_usuario = @cod_usuario `
                    request.input('cod_usuario', sql.Int,`${cod_usuario}`);
                }
                if(cod_subarea){
                    whereInfo +=` AND u.cod_subarea = @cod_subarea `
                    request.input('cod_subarea', sql.Int,`${cod_subarea}`);
                }
                if(marbete){
                    whereInfo +=` AND e.marbete like @marbete `
                    request.input('marbete', sql.NVarChar,`%${marbete}%`);
                }
                if(usuario_asigno){
                    whereInfo +=` AND e.marbete = @usuario_asigno `
                    request.input('usuario_asigno', sql.Int,`${usuario_asigno}`);
                }
                if(fecha1){
                    request.input('fecha1', sql.Date,`${fecha1}`);
                    if(fecha2){
                        whereInfo +=` AND  a.fecha_asignado >= @fecha1 AND a.fecha_asignado <= @fecha2 `
                        request.input('fecha2', sql.Date,`${fecha2}`);
                    }else{
                        whereInfo +=` AND  a.fecha_asignado = @fecha1  `
                    }

                    
                }
                
    
                 const countQuery = `
                    select 
                    count(*) as total
                    from asignaciones a
                    left join usuario u on u.cod_usuario = a.cod_usuario
                    left join sub_area sa on sa.cod_subarea = u.cod_subarea
                    left join usuario us on us.cod_usuario = a.usuario_asigno
                    left join equipos e on e.cod_equipo = a.cod_equipo
                    left join tipoequipo te on te.cod_tipo_equipo = e.cod_tipo_equipo
                    ${whereInfo}`
                ;
    
                const countResult = await request.query(countQuery);
                const total = countResult.recordset[0].total;
    
                let query = `select 
                    te.nombre as equipo,
                    e.marbete,
                    sa.nombre as area,
                    CONCAT(u.nombre,' ',u.apellido) as usuario,
                    CONCAT(us.nombre,' ',us.apellido) as usuario_asigno,
                    CONVERT(VARCHAR(10),a.fecha_asignado, 101) AS fecha_asignado,
                     case a.estado 
                        when 'A' then 'ACTIVO'
                        when 'N' then 'NO ACTIVO'
                    end as estado,
                    a.estado as estado_valor,
                    a.cod_asignacion
                    from asignaciones a
                    left join usuario u on u.cod_usuario = a.cod_usuario
                    left join sub_area sa on sa.cod_subarea = u.cod_subarea
                    left join usuario us on us.cod_usuario = a.usuario_asigno
                    left join equipos e on e.cod_equipo = a.cod_equipo
                    left join tipoequipo te on te.cod_tipo_equipo = e.cod_tipo_equipo
                    ${whereInfo}
                    ORDER BY a.fecha_asignado desc
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
    router.post('/new',async (req,res) => {
        const { usuario_entrega,usuario_recibe,observacion,firma_asigno,firma,equipos} = req.body;
        console.log(usuario_entrega,usuario_recibe,observacion,firma_asigno,firma,equipos)
        const request = pool.request(); 
        request.input('usuario_e',sql.Int,usuario_entrega);
        request.input('usuario_r',sql.Int,usuario_recibe);
        request.input('observacion',sql.NVarChar,observacion);
        request.input('firma_a',sql.NVarChar,firma_asigno);
        request.input('firma_r',sql.NVarChar,firma);
        request.input('equipos',sql.NVarChar,JSON.stringify(equipos));
        request.input('accion',sql.NVarChar,'A');
        request.input('marbete',sql.NVarChar,'');
        request.input('cod_asignacion',sql.Int,0);

        try {
            const result = await request.execute('asigancionesAcciones');
            res.json({ success: true, result: result.recordset });
        } catch (error) {
            console.error('Error ejecutando procedimiento:', error);
            res.status(500).json({ message: 'Error al registrar equipo' });
                }



    }); 
    router.put('/devolucion',async (req,res) => {
        const { cod_asignacion,firma_entrega,firma_recibe,accion,marbete,usuario_recibe} = req.body;
        
        const request = pool.request();
        request.input('usuario_e',sql.Int,0);
        request.input('usuario_r',sql.Int,usuario_recibe);
        request.input('observacion',sql.NVarChar,'');
        request.input('equipos',sql.NVarChar,'');
        request.input('cod_asignacion',sql.Int,cod_asignacion);
        request.input('firma_a',sql.NVarChar,firma_entrega);
        request.input('firma_r',sql.NVarChar,firma_recibe);
        request.input('accion',sql.NVarChar,accion);
        request.input('marbete',sql.NVarChar,marbete);

        try {
            const result = await request.execute('asigancionesAcciones');
            res.json({ success: true, result: result.recordset });
        } catch (error) {
            console.error('Error ejecutando procedimiento:', error);
            res.status(500).json({ message: 'Error al registrar equipo' });
        }
    });
    return router; 
}