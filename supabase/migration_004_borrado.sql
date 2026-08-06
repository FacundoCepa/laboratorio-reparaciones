-- ============================================================
-- Migración: permitir borrar equipos (y su historial/notificaciones)
-- Ejecutar en: Supabase → SQL Editor → New query
-- (Solo esto, sin bloques de código ni la palabra "sql" arriba)
-- ============================================================

create policy "equipos_delete_staff" on equipos for delete using (is_staff());
create policy "historial_delete_staff" on historial_estados for delete using (is_staff());
create policy "notificaciones_delete_staff" on notificaciones for delete using (is_staff());
