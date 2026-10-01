// Nombre del sistema en sí (lo que se ve cuando todavía no se sabe de
// qué taller es el usuario, por ejemplo en el título de la pestaña).
export const SISTEMA = {
  nombre: "Gestión de Reparaciones",
};

// Taller cuya marca se muestra en /login y /signup cuando se entra sin
// link de taller (así los clientes actuales de Fcepa no notan cambios).
// Los demás talleres comparten su propio link: /t/<slug>
export const TALLER_POR_DEFECTO = "fcepa";

// Talleres que pueden usar el botón "Pasar venta al sistema" (manda la
// venta a Argentina Express). Es tu sistema de gestión propio: los demás
// talleres que usen el sistema NO lo ven ni pueden usarlo.
export const TALLERES_CON_ERP = ["fcepa"];
