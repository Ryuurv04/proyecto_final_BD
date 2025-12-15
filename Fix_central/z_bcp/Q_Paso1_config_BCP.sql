--#######################################################################
-- Configurar BCP para exportar Archivos 
--Caso Práctico: Permite habilitar la exportacion a traves de la configuracion del SQL
--#######################################################################


--Paso 1: Configuracion de para exportar en BCP
-- Primero habilitar las opciones avanzadas
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;  -- <-- Actualiza los valores actuales para la configuraciones avanzadas
GO

-- Habilitar la configuracion xp_cmdshell
EXEC sp_configure 'xp_cmdshell', 1;
RECONFIGURE; -- <-- Actualiza los valores actuales para la configuraciones avanzadas
GO