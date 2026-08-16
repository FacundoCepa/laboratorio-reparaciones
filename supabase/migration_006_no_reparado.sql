-- ============================================================
-- Migración: agregar el estado "no_reparado" (alternativo a "reparado")
-- Ejecutar en: Supabase → SQL Editor → New query
-- (Solo esto, sin bloques de código ni la palabra "sql" arriba)
-- ============================================================

alter table equipos drop constraint if exists equipos_estado_check;
alter table equipos add constraint equipos_estado_check check (estado in (
  'registrado','recibido','revision','presupuesto','espera_presupuesto',
  'reparacion','reparado','no_reparado','finalizado','entrega','entregado'
));
