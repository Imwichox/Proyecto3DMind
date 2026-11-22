CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    estado ENUM('Activo', 'Bloqueado', 'Eliminado') DEFAULT 'Activo',
    intentos_fallidos INT DEFAULT 0,
    id_rol INT,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

CREATE TABLE historial_acceso (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    fecha_ingreso DATETIME,
    fecha_salida DATETIME,
    ip_acceso VARCHAR(45),
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE cliente (
    doc VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE pedido (
    n_pedido INT AUTO_INCREMENT PRIMARY KEY,
    cantidad INT,
    estado VARCHAR(50),
    fecha DATE,
    direccion_entrega VARCHAR(255),
    doc_cliente VARCHAR(20),
    id_usuario INT,
    FOREIGN KEY (doc_cliente) REFERENCES cliente(doc),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE venta (
    nro_factura INT AUTO_INCREMENT PRIMARY KEY,
    metodo_pago VARCHAR(50),
    fecha_venta DATE,
    valor DECIMAL(10,2),
    estado_venta VARCHAR(50),
    id_usuario INT,
    n_pedido INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (n_pedido) REFERENCES pedido(n_pedido)
);

CREATE TABLE abono (
    id_abono INT AUTO_INCREMENT PRIMARY KEY,
    valor_abono DECIMAL(10,2),
    fecha DATE,
    nro_factura INT,
    FOREIGN KEY (nro_factura) REFERENCES venta(nro_factura)
);