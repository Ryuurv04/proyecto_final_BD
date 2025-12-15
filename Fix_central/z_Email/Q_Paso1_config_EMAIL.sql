--#######################################################################
-- NOMBRE:Q_Paso1_config_EMAIL.sql
-- Configurar Database Mail (DBMail)
-- DESCRIPCION: Implementación de Respaldo Automatizado con Notificación vía Correo Electrónico
--#######################################################################
use msdb
Go

--0. Valida la Configuracion del Email
EXEC sp_configure 'Database Mail XPs';
GO

--1. Configura y Habilita el Datebase Mail
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;  -- <-- Actualiza los valores actuales para la configuraciones avanzadas
GO

EXEC sp_configure 'Database Mail XPs', 1;
RECONFIGURE; -- <-- Actualiza los valores actuales para la configuraciones avanzadas
Go

--2. Eliminar la cuenta asociada a un perfil (PerfilGmail), primero debes remover la asociacion con:
EXEC msdb.dbo.sysmail_delete_profileaccount_sp
	 @profile_name = 'PerfilGmail'
	,@account_name = 'CuentaGmail';

	-- Solo despues de desasociarlas, piede ejecutar:
	select * from msdb.dbo.sysmail_account
	EXEC msdb.dbo.sysmail_delete_account_sp
		@account_name = 'CuentaGmail';

	--Verfica para confirmar si la cuenta se elimino
	select * from msdb.dbo.sysmail_profile
	EXEC msdb.dbo.sysmail_delete_profile_sp
	@profile_name = 'PerfilGmail'
	 --@profile_id = 1

--3. Crea la cuenta de correo para enviar mensaje a mi correo Gmail 
EXEC msdb.dbo.sysmail_add_account_sp
	@account_name = 'CuentaGmail',
	@description = 'Cuenta de correo para enviar notificaciones desde SQL Server',
	@email_address = 'camanogust92@gmail.com',
	@display_name = 'SQL Server - Mail_2025',
	@mailserver_name = 'smtp.gmail.com', -- Cambia esto si usas otro servidor SMTP
	@port = 587,--Puerto SMTP para windows(ajustalo si usas otro servidor)
	@username = 'camanogust92@gmail.com',
	@password = 'udbu gilk nysh iycc', -- Aseg�rate de proteger tu contrase�a
	@enable_ssl = 1; -- Utiliza SSL para mayor seguridad


--4. Crea el Perfil y asociarlo a la cuenta de correo
EXEC msdb.dbo.sysmail_add_profile_sp
  @profile_name = 'PerfilGmail'
 ,@description = 'Cuenta de correo para enviar notificaciones desde SQL Server'


--5. Asociacion el Perfil creado al cuenta creada
EXEC msdb.dbo.sysmail_add_profileaccount_sp
  @profile_name = 'PerfilGmail'
 ,@account_name = 'CuentaGmail'
 ,@sequence_number = 1;  -- orden de prioridad como es el primero que se quiere ejecute se coloca 1


--6. Configurar el tama�o m�ximo de archivos adjuntos para el correo 
EXEC msdb.dbo.sysmail_configure_sp
	 @parameter_name = 'MaxFileSize'
	,@parameter_value = 10485760

	-- Intentos para enviar el correo en este caso son 2
	EXEC msdb.dbo.sysmail_configure_sp
		 @parameter_name = 'AccountRetryAttempts'
		,@parameter_value = 2;

	-- Tiempo entre intenos de reenvio es de 10 Segundos 
	EXEC msdb.dbo.sysmail_configure_sp
		 @parameter_name = 'AccountRetryDelay'
		,@parameter_value = 10000 

--7. Valida el envio del correo al Gmail camanogust92@gmail.com
EXEC msdb.dbo.sp_send_dbmail
  @profile_name = 'PerfilGmail'
 ,@recipients = 'camanogust92@gmail.com'
 ,@subject = '--Prueba de correo desde el DBMAIL de SQL Server--'
 ,@body = 'Este Mensaje de Prueba desde el servidor de correo de Prueba'

Go

