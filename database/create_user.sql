-- Active: 1747339866393@@127.0.0.1@3306
-- Crear usuario
CREATE USER 'cc5002'@'localhost' IDENTIFIED BY 'programacionweb';

-- Darle permisos al usuario
GRANT ALL PRIVILEGES ON tarea2.* TO 'cc5002'@'localhost';

-- Eliminar usuario de ser necesario
DROP USER 'dbadmin'@'localhost';
