---
description: "Reglas permanentes del proyecto 3D Mind: limpieza automatica, protecciones y verificacion"
trigger: always_on
---

# Reglas permanentes — Proyecto 3D Mind

Aplica estas reglas en CADA tarea o prompt de este proyecto.

## 1. Limpieza automatica en cada cambio

- Cada vez que modifiques, reemplaces o agregues algo, revisa el codigo relacionado y elimina de inmediato funciones, rutas, metodos, variables, imports (`require`/`import`), listeners, reglas CSS duplicadas o sin uso y bloques comentados viejos que queden obsoletos.
- Elimina archivos temporales, de prueba, duplicados o huerfanos que ya no use el proyecto. **Si hay duda sobre si un archivo o clase se usa, PREGUNTAR antes de borrarlo.**
- No generar codigo innecesario ni sobreingenieria. Mantener la arquitectura limpia: backend comun en `backend/` (`configuracion/`, `modelos/`, `controladores/`, `middleware/`, `rutas/`) y frontend en `frontend/` (`css/`, `js/`, `img/`).

## 2. Protecciones obligatorias (NUNCA borrar ni alterar)

- PROHIBIDO borrar o modificar: `database/` (schema, diagramas, evidencias), `frontend/assets/`, `.env`, `.env.example`, `.gitignore`, `README.md`, `package.json`, `package-lock.json`, `node_modules/`.
- Antes de eliminar una clase CSS o funcion JS, verificar que no se use dinamicamente (bordes rojo/verde con `✓`, modales de doble autenticacion, notificaciones de bienvenida, animacion escalonada del panel, alertas anti-BFCache, estados de SweetAlert2).
- No reintroducir el admin por defecto ni `DEFAULT_ADMIN_PASSWORD` como seeder; el primer admin se crea por el flujo `setup-status`/`setup-admin`.

## 3. Verificacion breve

- Al modificar backend o rutas, verificar que `node server.js` arranque sin errores en `http://localhost:3000` y avisar brevemente que archivos o codigo obsoleto se elimino en esa iteracion.

## Funcionalidades criticas que no se deben romper

- Flujo primera vez (`needsSetup`), primer ingreso de operario (sin repetir password actual + bienvenida automatica ~3 s), transicion logo + 3D MIND del login, notificaciones SweetAlert2 compactas arriba-derecha ~3 s, animacion escalonada de bloques/menu del panel.
- CRUD usuarios, validaciones rojo/verde con `✓`, bloqueo/desbloqueo con doble verificacion, 5 intentos fallidos, doble autenticacion admin (10 min), eliminacion logica (`estado='Eliminado'`), reautenticacion por inactividad (5 min), `sessionStorage`, anti-BFCache (`pageshow` + `no-store` + mensaje exacto de sesion cerrada), RBAC, menu desplegable de usuario, prevencion de guardado de contrasenas.
