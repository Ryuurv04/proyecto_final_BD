  
/*****************************************************/
-- NOMBRE:Jb_MantenimientoEquipo.sql
-- FECHA: 01 Dic 2025
-------------------------------------------------------
-- DESCRIPCION CONSULTA:
/*Trigger##Jobs##MSmail## Validar que paso 1 anho del ultimo mantenimiento del equipo, cuando ya paso un anho del equipo se le va a enviar un correo a la persona 
  que tiene asigndo el equipo y si nadie tiene el equipo asignado se lo va a enviar
  a todos lo que son del area de TIC.

>>>>>>>>
Pasos 1 : Haber Compilado el Script Fn_CalculaVenMantenimiento.sql
Pasos 2 : Haber Compilado el Script Q_Paso1_config_EMAIL.sql
Pasos 3 : Haber Compilado el Script Q_Paso1_config_BCP.sql
<<<<<<<<<<

Cuando se compila este Jobs estara generado el siguiente archivo:
	C:\proyecto_final_BD\Equipomantenimiento.txt
*/
/*****************************************************/
USE msdb;
GO

-- 1. Creacion de jobs
EXEC sp_add_job
	 @job_name = N'Jb_MantenimientoEquipo' 
	,@enabled = 1
	,@Description = N'Job de Mantenimiento Equipo TIC'
	,@category_name = N'Database Maintenance';
GO

-- 2. Pasos del Jobs
EXEC sp_add_jobstep
	  @job_name  = N'Jb_MantenimientoEquipo'
	, @step_name = N'CalculaManteEquipo'
	, @subsystem = N'TSQL'
	, @command = N'

USE [inventario]
Go

DECLARE @w_cuerpo NVARCHAR(MAX)
        ,@w_asunto NVARCHAR(255)
        ,@w_marbete_correo nvarchar(50)
        ,@w_serie_correo nvarchar(100)
        ,@w_usuario_correo nvarchar(200)
        ,@w_correo_ti nvarchar(200)


        ,@w_correotodos NVARCHAR(MAX)
        ,@w_asunto_correotodos NVARCHAR(255)
        ,@w_cuerpo_correotodos NVARCHAR(MAX)

BEGIN TRY

    -- THROW 51000, ''Probar el mensaje de Error por correo.'', 1;

    -----------------------------------------------------------------------------------------------------------------------------------
    -- Logica del Jobs
    -----------------------------------------------------------------------------------------------------------------------------------
    CREATE TABLE tmp_Equiposnoasignados (
          cod_equipo int
         ,marbete NVARCHAR(50)
         ,serie nvarchar(100)
    );

    -- 1. Inspecciona los equipo


    ---> CURSOR -- Declaracion variable cursor
    DECLARE @w_cod_equipo int, @w_estado nvarchar(1), @w_ultimo_mantenimiento date, @w_marbete nvarchar(50), @w_serie nvarchar(100);
    DECLARE cur CURSOR FOR
	    SELECT cod_equipo,estado,ultimo_mantenimiento,marbete,serie FROM [inventario].[dbo].[equipos] where dbo.Fn_CalculaVenMantenimiento(ultimo_mantenimiento) > 1;
    OPEN cur;
    FETCH NEXT FROM cur INTO @w_cod_equipo, @w_estado, @w_ultimo_mantenimiento, @w_marbete, @w_serie

    WHILE @@FETCH_STATUS = 0
    BEGIN
        
        IF exists( select 1 from [inventario].[dbo].[asignaciones] where cod_equipo = @w_cod_equipo) -- Valida que exista una asignacion del equipo antes de extraer los datos del Encargado del soporte Activo
        BEGIN
            select  --u.nombre as NombreTI 
                    @w_correo_ti = u.correo
                   ,@w_usuario_correo = CONCAT(uu.nombre, '' '', uu.apellido)
                   --,uu.correo as UsuarioCorreo
                   ,@w_marbete_correo = @w_marbete
                   ,@w_serie_correo = @w_serie
            from [inventario].[dbo].[asignaciones] a
            JOIN [inventario].[dbo].[usuario] u ON a.usuario_asigno = u.cod_usuario
            JOIN [inventario].[dbo].[usuario] uu ON a.cod_usuario = uu.cod_usuario
            where a.cod_equipo = @w_cod_equipo


            --
            ---CORREO a CADA Persona Asignada al equipo 
            --
            -----------------------------------------------------------------------------------------------------------------------------------
            -- PREPARATIVO Correo del Jobs Cada usuario asignado
            -----------------------------------------------------------------------------------------------------------------------------------
            SET @w_asunto = ''--Correo Mantenimiento Equipo Usuario--'';
            SET @w_cuerpo = 
	            ''Señor/ar Administrador recuerde el mantenimiento del equipo'' 
	            + CHAR(13) + CHAR(10)
	                + ''1.**Marbete**: '' + CAST( @w_marbete_correo AS NVARCHAR(100)) 
	                + CHAR(13) + CHAR(10)
	                    + ''2.**Serie**:'' + CAST( @w_serie_correo AS NVARCHAR(100))
	                    + CHAR(13) + CHAR(10)
	                        + ''3.**Usuario**:'' + CAST( @w_usuario_correo AS NVARCHAR(100))
                            + CHAR(13) + CHAR(10)

			EXEC msdb.dbo.sp_send_dbmail
			    @profile_name = ''PerfilGmail''
			    ,@recipients = @w_correo_ti
			    ,@subject =  @w_asunto
			    ,@body = @w_cuerpo

        END

        ELSE -- Valida que NO exista una asignacion del equipo para agruparlo en una temporal y enviarlo en un solo correo
        BEGIN
                INSERT INTO [inventario].[dbo].[tmp_Equiposnoasignados] (cod_equipo, marbete, serie)
                        SELECT @w_cod_equipo,@w_marbete ,@w_serie
        END
	    FETCH NEXT FROM cur INTO @w_cod_equipo, @w_estado, @w_ultimo_mantenimiento, @w_marbete, @w_serie;
    END

    CLOSE cur;
    DEALLOCATE cur;

    IF exists (select 1 from  [inventario].[dbo].[tmp_Equiposnoasignados] )
    BEGIN
        -----------------------------------------------------------------------------------------------------------------------------------
        -- PREPARATIVO Correo del Jobs TODO los ADM
        -----------------------------------------------------------------------------------------------------------------------------------
        SET @w_asunto_correotodos = ''--Correo Mantenimiento Equipo General--'';
        SET @w_cuerpo_correotodos = 
	        ''Señor/ar Administrador se adjunta a este correo para recordarle que el mantenimiento a todos los equipos'' 
	        + CHAR(13) + CHAR(10)
	        + ''1.**Archvios adjuntado**: ''
            + CHAR(13) + CHAR(10)
        -----------------------------------------------------------------------------------------------------------------------------------
        -- Query Correo del Jobs TODO los ADM
        -----------------------------------------------------------------------------------------------------------------------------------
        select @w_correotodos = STRING_AGG(correo,'';'')  -- Concatena en una solo fila todo los correo
        from [inventario].[dbo].[area] a
        JOIN [inventario].[dbo].[sub_area] sb ON a.cod_area = sb.cod_area 
        JOIN [inventario].[dbo].[usuario] u ON u.cod_subarea = sb.cod_subarea
        WHERE a.nombre = ''ADM''
           
  --      -----------------------------------------------------------------------------------------------------------------------------------
  --      -- BCP a TODO los ADM
  --      -----------------------------------------------------------------------------------------------------------------------------------
        Declare @cmd VARCHAR (8000);
        SET @cmd = ''bcp  "SELECT * FROM [inventario].[dbo].[tmp_Equiposnoasignados]" queryout "C:\proyecto_final_BD\Equipomantenimiento.txt" -c -t"|" -S '' + @@SERVERNAME+ '' -T'';
        EXEC xp_cmdshell @cmd;


		EXEC msdb.dbo.sp_send_dbmail
			@profile_name = ''PerfilGmail''
			,@recipients = @w_correotodos
			,@subject =  @w_asunto_correotodos
			,@body = @w_cuerpo_correotodos
            ,@file_attachments = ''C:\proyecto_final_BD\Equipomantenimiento.txt'';

    END

    --> BORRA LOS TEMPORALES <--
    --select * from tmp_Equiposnoasignados
    Drop table [inventario].[dbo].[tmp_Equiposnoasignados]

END TRY
BEGIN CATCH

        -----------------------------------------------------------------------------------------------------------------------------------
        -- PREPARATIVO Correo del Jobs TODO los ADM
        -----------------------------------------------------------------------------------------------------------------------------------
        SET @w_asunto_correotodos = ''--**Correo Fallo en la ejecución del Jobs Jb_MantenimientoEquipo Equipo General**--'';
        SET @w_cuerpo_correotodos = 
	        ''Ha ocurrido un **Error** durante el proceso de ejecución del Jobs Jb_MantenimientoEquipo de la base de datos.'' 
	        + CHAR(13) + CHAR(10)

        -----------------------------------------------------------------------------------------------------------------------------------
        -- Query Correo del Jobs TODO los ADM
        -----------------------------------------------------------------------------------------------------------------------------------
        select @w_correotodos = STRING_AGG(correo,'';'')  -- Concatena en una solo fila todo los correo
        from [inventario].[dbo].[area] a
        JOIN [inventario].[dbo].[sub_area] sb ON a.cod_area = sb.cod_area 
        JOIN [inventario].[dbo].[usuario] u ON u.cod_subarea = sb.cod_subarea
        WHERE a.nombre = ''ADM''

		EXEC msdb.dbo.sp_send_dbmail
		 @profile_name = ''PerfilGmail''
		,@recipients = @w_correotodos
		,@subject = @w_asunto_correotodos
		,@body = @w_cuerpo_correotodos


END CATCH

' 
	, @on_success_action = 1 -- Ir al siguiente paso
	, @on_fail_action = 2;   -- Finalizar jobs como fallido
GO

-- 3. Programar el Job para que se ejecute diariamente a la media noche 23:00
EXEC sp_add_jobschedule
	 @job_name = N'Jb_MantenimientoEquipo',
	 @name = N'EjecutarSemanalmente',
	 @freq_type = 4, --1: Solo uan vez --4: Diario --8: Semanal --16: Mensual --32: Mensual, relacionado con freq_interval. --64: Cuando el servicio del Agente SQL se inicia. --128: Cuando el equipo está inactivo.
	 @freq_interval = 1, --1: Diariamente
	 @freq_recurrence_factor = 1, -- 1: una Sola vez
	 @active_start_time = 235900; -- Medianoche
GO

-- 4. Asociar el Job programado al Servidor activo
EXEC sp_add_jobserver
	 @job_name = N'Jb_MantenimientoEquipo'
	, @server_name = @@SERVERNAME--N'(local)'; --@@SERVERNAME; Es el nombre del servidor del dominio agregado
GO

-- 5. Ejecuta la corrrida por demanda del Jobs 
-- EXEC msdb.dbo.sp_start_job @job_name = N'Jb_MantenimientoEquipo';
-- GO

-- 6. Ver ultimo historial de ejecucion
-- USE msdb
-- Go
-- EXEC dbo.sp_help_jobhistory @job_name = N'Jb_MantenimientoEquipo';
-- Go
	SELECT 
		j.name AS NombreJob,
		sjh.step_name AS Paso,
		msdb.dbo.agent_datetime(sjh.run_date, sjh.run_time) AS FechaYHoraEjecucion,
		CASE sjh.run_status 
			WHEN 0 THEN 'Fallido'
			WHEN 1 THEN 'Correcto'
			WHEN 2 THEN 'Reintentando'
			WHEN 3 THEN 'Cancelado'
			WHEN 4 THEN 'En Curso'
		END AS Estado,
		sjh.message AS Mensaje
	FROM  sysjobs j
			INNER JOIN sysjobhistory sjh ON j.job_id = sjh.job_id
	WHERE 
		j.name = N'Jb_MantenimientoEquipo'
	ORDER BY  FechaYHoraEjecucion DESC;