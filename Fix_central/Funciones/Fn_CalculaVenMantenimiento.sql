/*****************************************************/
-- NOMBRE:Fn_CalculaVenMantenimiento.sql
-- FECHA: 01 Dic 2025
-------------------------------------------------------
-- DESCRIPCION CONSULTA:
-- Permite calcular la fecha de Vencimiento de Inventario
/*****************************************************/

use inventario
go

IF EXISTS (select 1 from sys.objects where name = 'Fn_CalculaVenMantenimiento')
    DROP FUNCTION dbo.Fn_CalculaVenMantenimiento;
Go

CREATE FUNCTION Fn_CalculaVenMantenimiento(@i_fecha DATE) RETURNS INT
AS
BEGIN
    DECLARE @w_anhos INT
            ,@w_fecha_sistema DATE = GETDATE()

    IF @i_fecha IS NOT NULL
    BEGIN
        SET  @w_anhos = (
                    CONVERT(INT,CONVERT(CHAR(8), @w_fecha_sistema,112))
                    -
                    CONVERT(INT,CONVERT(CHAR(8),@i_fecha,112))
                )

                /

                10000
    END
    ELSE
        BEGIN
            SET @w_anhos = 0
        END

    RETURN @w_anhos
END
GO

SELECT dbo.Fn_CalculaVenMantenimiento('2015/05/20') AS AniosEnElSistema;
Go
SELECT dbo.Fn_CalculaVenMantenimiento(NULL) AS AniosEnElSistema;
Go
