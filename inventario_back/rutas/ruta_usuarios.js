const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql'); // Asegúrate de que este sea el driver que usas

module.exports = (pool) => {

    const router = express.Router(); 
    //busca a los usuarios
    router.get('/', async (req, res) => {
        const { cod_usuario, nombre,apellido } = req.query; 
        const request = pool.request();

       let query = "select u.cod_usuario,u.num_empleado,u.nombre,u.apellido from usuario u where u.estado = 'A' ";
       if(cod_usuario){
            if(isNaN(cod_usuario)){
                return res.status(400).json({ message: 'El código de usuario debe ser un número válido.' });           
            }
            query += ' and u.cod_usuario = @cod_usuario';
            request.input('cod_usuario',sql.Int, `${cod_usuario}`)
       }
       if(nombre){
            query += ' and u.nombre like @cod_usuario';
            request.input('cod_usuario',sql.VarChar, `%${nombre}%`)
       }
       if(apellido){
            query += ' and u.nombre like @cod_usuario';
            request.input('cod_usuario',sql.VarChar, `%${apellido}%`)
       }


        try {          
            const result = await request.query(query);
            res.json(result.recordset);
        } catch (error) {
            
            console.error('Error durante el proceso:', error);
            res.status(500).json({ message: 'Error Buscando al Usuario' });
        }
    });
    //registra a los usuarios
    router.post('/', async (req,res)=>{
        const { num_empleado, nombre,apellido,cod_subarea ,contrasena,correo} = req.body; 
        

        if(!nombre || !apellido || !num_empleado || !cod_subarea){
            return res.status(400).json({message: 'Nombre, Apellido y cod_usuario con obligatorios.'})
        }
        try {
            const request = pool.request();
            let usuario= nombre.charAt(0).toLowerCase()+apellido.toLowerCase();
            let contrasenaHash="";
            if(contrasena){
                contrasenaHash = await bcrypt.hash(contrasena, 10);
            }
            request.input('num_empleado',sql.Int,num_empleado);
            request.input('cod_subarea',sql.Int,cod_subarea);
            request.input('nombre',sql.VarChar,nombre);
            request.input('apellido',sql.VarChar,apellido);
            request.input('contrasena',sql.VarChar,contrasenaHash);
            request.input('usuario',sql.VarChar,usuario);
            request.input('correo',sql.VarChar,correo);

            const result = await request.query(`
                insert into usuario(num_empleado,usuario,contrasena,nombre,apellido,estado,correo,cod_subarea) 
                values(@num_empleado,@usuario,@contrasena,@nombre,@apellido,'A',@correo,@cod_subarea);
            `)
            res.status(201).json({
                message: 'Usuario creado exitosamente con campos limitados.'   
            });
        } catch (error) {
            console.error('Error durante el proceso :', error);
            res.status(500).json({ message: 'Error Registrando al Usuario.' });
        }
    });
    // desabilita a los usuarios si no tienen equipos asignados
    router.delete('/:cod_usuario', async (req, res)=>{
        const {cod_usuario} = req.params;
        if(!cod_usuario){
            return res.status(400).json({message: 'El codigo de usuario es Obligatorio'});
        }

        try {
            const request = pool.request();
            request.input('cod_usuario',sql.Int,cod_usuario);

            const query = `select count(*) as total_equipos from equipo_asignado ea where ea.cod_usuario = @cod_usuario and ea.estado = 'A'`
            
            const resultado = await request.query(query);
            const equipos_asignados = resultado.recordset[0].total_equipos;
            
            if(equipos_asignados > 0){
                 return res.status(400).json({
                    message: `No se puede eliminar el usuario. Tiene ${equipos_asignados} equipo(s) asignado(s).`
                });
            }

            const usaurio_desabilitado = `UPDATE usuario
                SET estado = 'D' 
                WHERE cod_usuario = @cod_usuario;`
            const resultado2 = await request.query(usaurio_desabilitado);

             if (resultado2.rowsAffected[0] > 0) {
                res.json({ message: 'Usuario eliminado lógicamente (estado cambiado a "D") exitosamente.' });
            } else {
                // Si rowsAffected es 0, significa que no se encontró el usuario con ese cod_usuario.
                res.status(404).json({ message: 'Usuario no encontrado.' });
            }


        } catch (error) {
            console.error('Error durante el proceso :', error);
            res.status(500).json({ message: 'Error Registrando al Usuario.' });
        }

    });
    return router; 
};