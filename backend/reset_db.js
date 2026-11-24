// Script de reinicio limpio - Vacia tablas transaccionales y deja el sistema
// listo para la configuracion inicial del primer administrador (setup).
// Uso: node backend/reset_db.js  (o desde backend/: node reset_db.js)
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bd = require('./configuracion/basedatos');

// Tablas con datos transaccionales/de prueba (se vacian).
// Los catalogos (rol, tipo_documento, estado_pedido, estado_venta, metodo_pago, insumo) NO se tocan.
// Orden: primero las tablas hijas por llaves foraneas.
const TABLAS_DATOS = [
    'abono',
    'venta',
    'detalle_pedido',
    'pedido',
    'cliente',
    'historial_acceso',
    'usuario'
];

async function resetear() {
    const conexion = await bd.obtenerConexion();
    try {
        await conexion.query('SET FOREIGN_KEY_CHECKS = 0');

        for (const tabla of TABLAS_DATOS) {
            await conexion.query(`DELETE FROM ${tabla}`);
            await conexion.query(`ALTER TABLE ${tabla} AUTO_INCREMENT = 1`);
            console.log(`${tabla}: vaciada y AUTO_INCREMENT reiniciado`);
        }

        await conexion.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Base de datos reiniciada. El primer ingreso debe configurar el administrador desde la pantalla de inicio.');
    } finally {
        conexion.release();
        process.exit(0);
    }
}

resetear().catch(error => {
    console.error('Error al reiniciar la base de datos:', error);
    process.exit(1);
});
