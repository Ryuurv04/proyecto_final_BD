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
        let {pag =1,limite =5,busqueda='' } = req.query
        pag = parseInt(pag);
        limite = parseInt(limite);
        const offset = (pag - 1) * limite;
        try {  
            let whereInfo = ``;

            if(busqueda){
                whereInfo +=` Where (e.marbete LIKE @buscar OR e.serie LIKE @buscar OR te.nombre like @buscar) `
                request.input('buscar', sql.VarChar,`%${busqueda}%`);
            }

             const countQuery = `
                SELECT COUNT(*) AS total
                FROM equipos e
                left join tipoequipo te on te.cod_tipo_equipo = e.cod_tipo_equipo
                ${whereInfo}`
            ;

            const countResult = await request.query(countQuery);
            const total = countResult.recordset[0].total;

       let query = `select 
            e.cod_equipo,
            te.cod_tipo_equipo as 'tipo',
            te.nombre as 'tipo_equipo',
            e.marbete,e.serie,CONVERT(VARCHAR(10), e.fecha_recepcion, 101) AS fecha_recepcion,
            case e.estado 
                when 'A' then 'ACTIVO'
                when 'S' then 'ASIGNADO'
                when 'D' then 'DESCARTE'
                when 'M' then 'MANTENIMIENTO'
            end as estado
            ,e.estado as estado_valor
            ,e.cod_proveedor,e.garantia_meses
            from equipos e
            left join tipoequipo te on te.cod_tipo_equipo = e.cod_tipo_equipo
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
    router.get('/conteoarea',async (req,res)=>{
       const request = pool.request(); 
       let query = `select count(*) from asignaciones`;
        try {          
            const result = await request.query(query);
            res.json(result.recordset);

        } catch (error) {
            
            console.error('Error durante el proceso:', error);
            res.status(500).json({ message: 'Error Buscando al Usuario' });
        }
    });
    // registrar equipos
    router.post('/add',async (req,res)=>{
        const { tipo, serie, marbete, garantia, estado,fecha,proveedor,cod_usuario,...camposVariables} = req.body;
        const arrayDeEspecificaciones = Object.values(camposVariables);
        console.log(cod_usuario)
        const request = pool.request(); 
        request.input('tipoequipo',sql.Int,tipo);
        request.input('proveedor',sql.NVarChar, proveedor.toString());
        request.input('serie',sql.NVarChar,serie);
        request.input('marbete',sql.NVarChar,marbete);
        request.input('garantia',sql.Int,garantia);
        request.input('estado',sql.NVarChar,estado);
        request.input('fecha',sql.Date,fecha);
        request.input('extras',sql.NVarChar,JSON.stringify(camposVariables));
        request.input('accion',sql.NVarChar,'I');
        request.input('cod_equipo',sql.Int,0);
        request.input('cod_usuario',sql.Int,cod_usuario);
        try {
            const result = await request.execute('EquiposAcciones');
            res.json({ success: true, result: result.recordset });
        } catch (error) {
            console.error('Error ejecutando procedimiento:', error);
            res.status(500).json({ message: 'Error al registrar equipo' });
        }

    });
    router.put('/:cod_equipo',async (req,res)=>{
        const request = pool.request(); 
        
        const { cod_equipo,tipo, serie, marbete, garantia, estado,fecha,proveedor,cod_usuario,...camposVariables} = req.body;
         
        if(!tipo && !serie && !marbete && !garantia && !estado && !fecha && !proveedor){
            return res.status(400).json({message: 'Error todos los datos son necesarios'});
        }
        if(isNaN(cod_equipo)){
           return res.status(400).json({message: 'Error valor invalido de cod_equipo'}); 
        }

        request.input('tipoequipo',sql.Int,tipo);
        request.input('proveedor',sql.NVarChar, proveedor.toString());
        request.input('serie',sql.NVarChar,serie);
        request.input('marbete',sql.NVarChar,marbete);
        request.input('garantia',sql.Int,garantia);
        request.input('estado',sql.NVarChar,estado);
        request.input('fecha',sql.Date,fecha);
        request.input('extras',sql.NVarChar,JSON.stringify(camposVariables));
        request.input('accion',sql.NVarChar,'E');
        request.input('cod_equipo',sql.Int,cod_equipo);
        request.input('cod_usuario',sql.Int,cod_usuario);
        try {
            const result = await request.execute('EquiposAcciones');
            res.json({ success: true, result: result.recordset });
        } catch (error) {
            console.error('Error ejecutando procedimiento:', error);
            res.status(500).json({ message: 'Error al registrar equipo' });
        }
    });

    router.get('/disponibles',async(req,res)=>{
        const request = pool.request();
        let query = `select 
            e.cod_equipo,
            e.marbete,
            te.nombre as tipo_equipo
            from equipos e
            left join tipoequipo te on te.cod_tipo_equipo = e.cod_tipo_equipo 
            where e.estado in ('A','S')
            order by e.marbete`;

        try {         
            const result = await request.query(query);
            
            res.json(result.recordset);
        } catch (error) {
            console.error('Error durante el proceso:', error);
            res.status(500).json({ message: 'Error Buscando al Usuario' });
        }
    });
    router.get('/:cod_equipo', async(req,res)=>{
        const request = pool.request();
        const { cod_equipo } = req.params;
        if (!cod_equipo ) {
            return res.status(400).json({ message: 'Error Con el codigo de Equipo' });
        }
        try {
            const query = `select 
            e.cod_equipo,
            te.nombre as tipo_equipo,
            e.marbete,
            case e.estado 
                when 'A' then 'ACTIVO'
                when 'S' then 'ASIGNADO'
                when 'D' then 'DESCARTE'
                when 'M' then 'MANTENIMIENTO'
            end as estado,
            e.estado as estado_valor
            from equipos e
            left join tipoequipo te on te.cod_tipo_equipo = e.cod_tipo_equipo 
            where e.cod_equipo = @cod_equipo`;
            request.input('cod_equipo', sql.Int,`${cod_equipo}`);
            const result = await request.query(query);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ message: 'No se pudieron cargar los productos. Inténtalo de nuevo.' });
        }
    });

    return router; 
};