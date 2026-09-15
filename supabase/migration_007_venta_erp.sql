-- ============================================================
-- Migración: enlace con la venta creada en Argentina Express
-- Ejecutar en: Supabase → SQL Editor → New query
-- (Solo esto, sin bloques de código ni la palabra "sql" arriba)
-- ============================================================

alter table equipos add column if not exists venta_erp_id text;
alter table equipos add column if not exists venta_erp_numero integer;
alter table equipos add column if not exists venta_erp_creada_at timestamptz;
