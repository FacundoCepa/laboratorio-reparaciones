-- ============================================================
-- Migración: informe de reparación y costos
-- Ejecutar en: Supabase → SQL Editor → New query
-- (Solo esto, sin bloques de código ni la palabra "sql" arriba)
-- ============================================================

alter table equipos add column if not exists diagnostico text;
alter table equipos add column if not exists trabajo_realizado text;
alter table equipos add column if not exists repuestos_utilizados text;
alter table equipos add column if not exists costo_mano_obra numeric(12,2) not null default 0;
alter table equipos add column if not exists costo_repuestos numeric(12,2) not null default 0;
alter table equipos add column if not exists garantia_dias integer not null default 90;
alter table equipos add column if not exists observaciones text;
alter table equipos add column if not exists tecnico_nombre text;
alter table equipos add column if not exists finalizado_at timestamptz;
