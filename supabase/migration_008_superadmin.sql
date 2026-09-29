-- ============================================================
-- Migración 008: marcarte como superadministrador
-- Ejecutar en: Supabase → SQL Editor → New query, DESPUÉS de la 007.
--
-- Reemplazá TU-EMAIL por el email con el que entrás al sistema
-- (dejá las comillas simples). Esto te habilita la pestaña "★ Admin"
-- para dar de alta talleres y manejar sus suscripciones.
-- ============================================================

update profiles set superadmin = true where email = 'TU-EMAIL';

-- Para verificar que quedó bien (tiene que aparecer tu usuario):
select nombre, email, role, superadmin from profiles where superadmin;
