import { insertAgencias } from "./inserts/insertAgencias";
import { insertDepartamentos } from "./inserts/insertDepartamentos";
import { insertDetalleSolicitudIfNotExists } from "./inserts/insertDetallesolicitud";
import { insertDirectorios } from "./inserts/insertDirectorio";
import { insertEstadoAgenciasIfNotExists } from "./inserts/insertEstadoAgencias";
import { insertEstadoIfNotExists } from "./inserts/insertEstados";
import { insertEstadoTecnicoIfNotExists } from "./inserts/insertEstadoTecnico";
import { insertEstadoUpsIfNotExists } from "./inserts/insertEstadoUps";
import { insertMarcaIfNotExists } from "./inserts/insertMarcas";
import { insertModelos } from "./inserts/insertModelos";
import { insertRolesIfNotExists } from "./inserts/insertRoles";
import { insertTecnicos } from "./inserts/insertTecnicos";
import { insertTipoInventarioIfNotExists } from "./inserts/insertTipoInventario";
import { insertTipoTamanoIfNotExists } from "./inserts/insertTipoTamano";
import { insertAdminIfNotExists } from "./inserts/insertUsuario";
import pool from "./mysql";

const crearTablasEnLaBaseDeDatos = async () => {
    try {
        // Conectar al servidor MySQL
        const connection = await pool.getConnection();

        // Crear la base de datos si no existe
        await connection.query(`CREATE DATABASE IF NOT EXISTS sistema_ti_bancocci`);

        // Seleccionar la base de datos
        await connection.query(`USE sistema_ti_bancocci`);

        // Crear las tablas si no existen
        const queries = [
            `CREATE TABLE IF NOT EXISTS departamentos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50)
            );`,

            `CREATE TABLE IF NOT EXISTS tipo_tamano (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(250)
            );`,

            `CREATE TABLE IF NOT EXISTS marca (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50)
            );`,

            `CREATE TABLE IF NOT EXISTS estado (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50)
            );`,

            `CREATE TABLE IF NOT EXISTS estado_agencias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50)
            );`,

            `CREATE TABLE IF NOT EXISTS estado_ups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50)
            );`,

            `CREATE TABLE IF NOT EXISTS estado_tecnico (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50)
            );`,

            `CREATE TABLE IF NOT EXISTS tipo_inventario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50)
            );`,

            `CREATE TABLE IF NOT EXISTS rol (
                id INT AUTO_INCREMENT PRIMARY KEY,
                descripcion VARCHAR(250)
            );`,

            `CREATE TABLE IF NOT EXISTS modelo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                marca_id INT,
                FOREIGN KEY (marca_id) REFERENCES marca(id)
            );`,

            `CREATE TABLE IF NOT EXISTS agencias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50),
                ubicacion VARCHAR(150),
                codigo INT,
                estado_agencias_id INT,
                FOREIGN KEY (estado_agencias_id) REFERENCES estado_agencias(id)
            );`,

            `CREATE TABLE IF NOT EXISTS usuario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(250),
                correo VARCHAR(250),
                usuario VARCHAR(250),
                contraseña VARCHAR(500),
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                rol_id INT,
                FOREIGN KEY (rol_id) REFERENCES rol(id)
            );`,

            `CREATE TABLE IF NOT EXISTS tecnico (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50),
                numero_identidad INT,
                estado_id INT,
                FOREIGN KEY (estado_id) REFERENCES estado_tecnico(id)
            );`,

            `CREATE TABLE IF NOT EXISTS directorios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                extension INT,
                departamento_id INT,
                agencias_id INT,
                empleado VARCHAR(150),
                FOREIGN KEY (departamento_id) REFERENCES departamentos(id),
                FOREIGN KEY (agencias_id) REFERENCES agencias(id)
            );`,

            `CREATE TABLE IF NOT EXISTS ups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                agencias_id INT,
                nombre VARCHAR(250),
                modelo VARCHAR(250),
                direccion_ip VARCHAR(50),
                kva INT,
                fecha_instalacion DATE,
                años_uso INT,
                proximo_cambio DATE,
                estado_ups_id INT,
                modulos INT,
                baterias INT,
                tipo_tamano_id INT,
                observacion VARCHAR(500),
                FOREIGN KEY (agencias_id) REFERENCES agencias(id),
                FOREIGN KEY (tipo_tamano_id) REFERENCES tipo_tamano(id),
                FOREIGN KEY (estado_ups_id) REFERENCES estado_ups(id)
            );`,

            `CREATE TABLE IF NOT EXISTS ups_mapa (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ups_id INT,                              
                lat DECIMAL(10, 8),                     
                lon DECIMAL(11, 8),                      
                estado ENUM('online', 'offline') DEFAULT 'offline',  
                FOREIGN KEY (ups_id) REFERENCES ups(id)
            );`,

            `CREATE TABLE IF NOT EXISTS historial_cambio_ups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ups_id INT,
                cambio VARCHAR(250),
                fecha_instalacion DATE,
                proximo_cambio DATE,
                FOREIGN KEY (ups_id) REFERENCES ups(id)
            );`,

            `CREATE TABLE IF NOT EXISTS detalle_solicitud (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50)
            );`,

            `CREATE TABLE IF NOT EXISTS inventario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo VARCHAR(50),
                serie VARCHAR(150),
                tipo_inventario_id INT,
                marca_id INT,
                modelo_id INT,
                agencias_id_origen INT,
                agencias_id_actual INT,
                estado_id INT,
                usuario_id INT,
                comentarios VARCHAR(500),
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tipo_inventario_id) REFERENCES tipo_inventario(id),
                FOREIGN KEY (marca_id) REFERENCES marca(id),
                FOREIGN KEY (modelo_id) REFERENCES modelo(id),
                FOREIGN KEY (agencias_id_origen) REFERENCES agencias(id),
                FOREIGN KEY (agencias_id_actual) REFERENCES agencias(id),
                FOREIGN KEY (estado_id) REFERENCES estado(id),
                FOREIGN KEY (usuario_id) REFERENCES usuario(id)
            );`,

            `CREATE TABLE IF NOT EXISTS historial_cambio_inventario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                inventario_id INT,
                cambio_realizado VARCHAR(500) NOT NULL,
                usuario_id INT,
                fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (inventario_id) REFERENCES inventario(id),
                FOREIGN KEY (usuario_id) REFERENCES usuario(id)
            );`,

            `CREATE TABLE IF NOT EXISTS detalle_equipo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                descripcion_equipo VARCHAR(100),
                inventario_id INT,
                agencias_id INT,
                FOREIGN KEY (inventario_id) REFERENCES inventario(id),
                FOREIGN KEY (agencias_id) REFERENCES agencias(id)
            );`,

            `CREATE TABLE IF NOT EXISTS control_equipo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fecha DATE,
                tecnico_id INT,
                agencias_id INT,
                n_ticket_mesa_ayuda INT,
                zona_region VARCHAR(250),
                detalle_solicitud_id INT,
                usuario_id INT,
                observacion VARCHAR(500),
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tecnico_id) REFERENCES tecnico(id),
                FOREIGN KEY (agencias_id) REFERENCES agencias(id),
                FOREIGN KEY (detalle_solicitud_id) REFERENCES detalle_solicitud(id),
                FOREIGN KEY (usuario_id) REFERENCES usuario(id)
            );`,

            `CREATE TABLE IF NOT EXISTS control_equipo_detalle (
                id INT AUTO_INCREMENT PRIMARY KEY,
                control_equipo_id INT,
                detalle_equipo_id INT,
                FOREIGN KEY (control_equipo_id) REFERENCES control_equipo(id),
                FOREIGN KEY (detalle_equipo_id) REFERENCES detalle_equipo(id)
            );`
        ];

        for (const query of queries) {
            await connection.query(query);
        }

        console.log('Base de datos y tablas ccreadas exitosamente.');

        //Insert roles 
        await insertRolesIfNotExists(connection);
        //Insert tipo_tamano
        await insertTipoTamanoIfNotExists(connection);
        //Insert estado (inentarios)
        await insertEstadoIfNotExists(connection);
        //Insert estado_agencias
        await insertEstadoAgenciasIfNotExists(connection);
        //Insert estado_tecnico
        await insertEstadoTecnicoIfNotExists(connection);
        //Insert estado_ups
        await insertEstadoUpsIfNotExists(connection);
        //Insert detalle_solicitud
        await insertDetalleSolicitudIfNotExists(connection);
        //Insert tipo_inventario
        await insertTipoInventarioIfNotExists(connection);
        //Insert marcas
        await insertMarcaIfNotExists(connection);
        //Insert Admin
        await insertAdminIfNotExists(connection);
        //Insert departamentos
        await insertDepartamentos(connection);
        //Insert Agencias 
        await insertAgencias(connection);
        //Insert directorio 
        await insertDirectorios(connection);
        //Insert Tecnicos 
        await insertTecnicos(connection);
        //Insert Modelos 
        await insertModelos(connection);

        connection.release();

    } catch (error) {
        console.error('Error al crear la base de datos o las tablas:', error);
    }
};

export default crearTablasEnLaBaseDeDatos;
