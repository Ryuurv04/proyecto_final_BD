--Paso (1) BD_CREATE
use master
go
CREATE DATABASE inventario
ON
PRIMARY(
	 NAME = inventario_DATOS
	,FILENAME = 'C:\proyecto_final_BD\inventario_DATA.mdf'
	,SIZE = 200MB
	,MAXSIZE = 500MB
	,FILEGROWTH = 50MB
)
LOG ON(
	 NAME = inventario_LOG
	,FILENAME = 'C:\proyecto_final_BD\inventario_LOG.mdf'
	,SIZE = 40MB
	,MAXSIZE = 100MB
	,FILEGROWTH = 5MB
)
GO

USE inventario
Go

