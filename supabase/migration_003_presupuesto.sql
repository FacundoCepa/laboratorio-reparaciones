-- ============================================================
-- Migración: presupuestos con aceptación/rechazo del cliente
-- Ejecutar en: Supabase → SQL Editor → New query
-- (Solo esto, sin bloques de código ni la palabra "sql" arriba)
-- ============================================================

alter table equipos add column if not exists presupuesto_detalle text;
alter table equipos add column if not exists presupuesto_mano_obra numeric(12,2) not null default 0;
alter table equipos add column if not exists presupuesto_repuestos numeric(12,2) not null default 0;
alter table equipos add column if not exists presupuesto_enviado_at timestamptz;
alter table equipos add column if not exists presupuesto_respuesta text check (presupuesto_respuesta in ('aceptado','rechazado'));
alter table equipos add column if not exists presupuesto_respuesta_at timestamptz;
