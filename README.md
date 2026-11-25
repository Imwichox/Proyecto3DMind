# Proyecto 3D MIND

Plataforma web para una empresa de ingenieria enfocada en impresion 3D.

## Tecnologias

- **Backend**: Node.js + Express 5 (arquitectura por capas: rutas → controladores → modelos)
- **Base de datos**: MySQL (XAMPP en local)
- **Seguridad**: bcryptjs (hash de contraseñas), sesiones en `sessionStorage`, doble autenticacion para acciones protegidas, RBAC por roles, anti-cache/BFCache
- **Frontend**: HTML + CSS + JavaScript vanilla (sin frameworks), iconos Lucide, notificaciones SweetAlert2

## Estructura del proyecto

```
Proyecto3DMind/
├── backend/
│   ├── configuracion/basedatos.js   # Conexion MySQL (pool)
│   ├── controladores/               # Logica de negocio por modulo
│   ├── modelos/                     # Consultas SQL parametrizadas
│   ├── middleware/                  # Verificacion de roles (admin / self)
│   ├── rutas/                       # Definicion de endpoints API
│   ├── server.js                    # Servidor Express principal
│   ├── reset_db.js                  # Reinicia la BD (vuelve a needsSetup)
│   ├── .env                         # Variables locales (NO versionar)
│   └── .env.example                 # Plantilla de variables
├── frontend/
│   ├── index.html                   # Pantalla de bienvenida / setup inicial
│   ├── login.html                   # Inicio de sesion
│   ├── panel.html                   # Panel principal (RBAC)
│   ├── css/estilos.css              # Estilos (paleta Carbon + Plata)
│   ├── js/app.js                    # Cliente API + clases de sesion
│   └── img/                         # Logo e iconos
├── database/
│   ├── proyecto_3d_mind.sql         # Esquema de la base de datos
│   ├── Image_Modelo_Relacional_3dMind_MysqlWB.png  # Modelo relacional
│   └── Modelo Relacional MysqlWB.mwb              # Archivo MySQL Workbench
├── docs/                            # Manuales en PDF y guia interactiva del sistema
├── .devin/rules/                    # Reglas permanentes del proyecto
└── package.json
```

## Requisitos

- Node.js (v18+)
- MySQL corriendo en XAMPP (puerto 3306 por defecto)
- Base de datos `proyecto_3d_mind` creada e importada desde `database/proyecto_3d_mind.sql`

## Instalacion y ejecucion

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Crear `backend/.env` a partir de `backend/.env.example` (valores por defecto ya funcionan con XAMPP)
4. Importar `database/proyecto_3d_mind.sql` en MySQL (phpMyAdmin)
5. Iniciar el servidor: `npm start` (equivale a `node backend/server.js`)
6. Abrir en el navegador: `http://localhost:3000`

El servidor siembra automaticamente los catalogos base (roles y tipos de documento). **No crea usuarios**: la primera pantalla detecta `needsSetup` y guia la creacion del administrador inicial.

## Primer ingreso y flujo de seguridad

- **Primer uso**: se crea el administrador desde la pantalla de inicio (`/auth/setup-status` → `setup-admin`).
- **Operarios**: se crean desde el panel de Usuarios; su primer ingreso exige cambiar la contrasena (`debe_cambiar_password`).
- **Acciones protegidas**: el modulo de Usuarios y demas acciones sensibles piden doble verificacion de contrasena (ventana de 10 min).
- **Inactividad**: a los 4.5 minutos aparece un aviso de 30 s; a los 5 minutos se exige reautenticacion con contrasena.
- **Bloqueo**: 5 intentos fallidos de login bloquean al usuario; el administrador puede bloquear/desbloquear manualmente (con verificacion).

## Modulos

- Usuarios y Autenticacion (implementado)
- Historial de accesos (implementado)
- Clientes, Pedidos, Ventas, Insumos, Reportes (proximamente)

## Scripts utiles

- `npm start` — inicia el servidor en `http://localhost:3000`
- `node backend/reset_db.js` — vacia las tablas y reinicia la BD (vuelve al flujo `needsSetup`)
