-- ============================================================
-- Migración 007: sistema multi-taller
-- Ejecutar en: Supabase → SQL Editor → New query
-- (Copiar y pegar TODO esto, sin bloques de código ni la palabra "sql" arriba)
--
-- Qué hace:
--  * Crea la tabla "talleres" (cada negocio que usa el sistema).
--  * Crea el taller "fcepa" con los datos actuales y le asigna TODOS
--    los usuarios y equipos que ya existen (no se pierde nada).
--  * Cada taller tiene su propia numeración de casos (la de Fcepa sigue
--    desde el último número que ya tenía).
--  * Reescribe la seguridad (RLS) para que un taller nunca pueda ver
--    clientes ni equipos de otro, y para que un taller suspendido o
--    vencido quede bloqueado.
-- ============================================================

begin;

-- 1) TALLERES ------------------------------------------------
create table if not exists talleres (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre text not null,
  nombre_corto text,
  logo_url text,
  banner_url text,
  banner_link text,
  direccion text,
  telefono text,
  whatsapp text,
  email text,
  horarios text,
  razon_social text,
  cuit text,
  condicion_iva text,
  texto_garantia text,
  activo boolean not null default true,
  vence_at date,
  plan text not null default 'gratis',
  proximo_numero integer not null default 1,
  creado_at timestamptz not null default now()
);

insert into talleres (slug, nombre, nombre_corto, logo_url, banner_url, banner_link)
values (
  'fcepa',
  'FcepaComputación & Argentina Express',
  'FcepaComputación',
  '/logo-argentina-express.webp',
  '/banner-tienda.png',
  'https://argentinaexpress.mitiendanube.com/'
)
on conflict (slug) do nothing;

-- 2) PROFILES: a qué taller pertenece cada usuario ------------
alter table profiles add column if not exists taller_id uuid references talleres(id) on delete cascade;
alter table profiles add column if not exists superadmin boolean not null default false;
update profiles set taller_id = (select id from talleres where slug = 'fcepa') where taller_id is null;
alter table profiles alter column taller_id set not null;
create index if not exists profiles_taller_idx on profiles(taller_id);

-- 3) EQUIPOS: a qué taller pertenece cada equipo -------------
alter table equipos add column if not exists taller_id uuid references talleres(id) on delete cascade;
update equipos set taller_id = (select id from talleres where slug = 'fcepa') where taller_id is null;
alter table equipos alter column taller_id set not null;
create index if not exists equipos_taller_idx on equipos(taller_id);

-- Numeración por taller: Fcepa sigue desde su último número.
update talleres
set proximo_numero = coalesce((select max(numero) from equipos where taller_id = talleres.id), 0) + 1
where slug = 'fcepa';
alter table equipos alter column numero drop default;
alter table equipos drop constraint if exists equipos_taller_numero_unique;
alter table equipos add constraint equipos_taller_numero_unique unique (taller_id, numero);

-- 4) FUNCIONES DE AYUDA --------------------------------------
-- Taller del usuario actual, SOLO si está activo y no vencido.
-- Si el taller está suspendido devuelve null y todo queda bloqueado.
create or replace function mi_taller()
returns uuid
language sql stable security definer set search_path = public
as $$
  select p.taller_id
  from profiles p
  join talleres t on t.id = p.taller_id
  where p.id = auth.uid()
    and t.activo
    and (t.vence_at is null or t.vence_at >= current_date);
$$;

-- ¿El usuario actual es admin o técnico de un taller activo?
create or replace function is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from profiles p
    join talleres t on t.id = p.taller_id
    where p.id = auth.uid()
      and p.role in ('admin', 'tecnico')
      and t.activo
      and (t.vence_at is null or t.vence_at >= current_date)
  );
$$;

-- Taller del usuario actual aunque esté suspendido (solo para poder
-- leer sus propios datos y mostrarle el aviso de suspensión).
create or replace function mi_taller_sin_filtro()
returns uuid
language sql stable security definer set search_path = public
as $$
  select taller_id from profiles where id = auth.uid();
$$;

-- 5) TRIGGER: al crear un equipo, se le asigna el taller de su
--    cliente y el próximo número de caso de ese taller.
create or replace function equipos_antes_de_insertar()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  select taller_id into new.taller_id from profiles where id = new.cliente_id;
  if new.taller_id is null then
    raise exception 'El cliente no pertenece a ningún taller';
  end if;
  if new.numero is null then
    update talleres
    set proximo_numero = proximo_numero + 1
    where id = new.taller_id
    returning proximo_numero - 1 into new.numero;
  end if;
  return new;
end;
$$;

drop trigger if exists equipos_antes_de_insertar on equipos;
create trigger equipos_antes_de_insertar
before insert on equipos
for each row execute function equipos_antes_de_insertar();

-- Al editar un equipo no se puede pasar a un cliente de otro taller.
create or replace function equipos_antes_de_actualizar()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.cliente_id is distinct from old.cliente_id
     and not exists (select 1 from profiles where id = new.cliente_id and taller_id = new.taller_id) then
    raise exception 'El cliente no pertenece a este taller';
  end if;
  return new;
end;
$$;

drop trigger if exists equipos_antes_de_actualizar on equipos;
create trigger equipos_antes_de_actualizar
before update on equipos
for each row execute function equipos_antes_de_actualizar();

-- 6) SEGURIDAD (RLS) -----------------------------------------
alter table talleres enable row level security;

drop policy if exists "profiles_select_propio" on profiles;
drop policy if exists "profiles_update_propio" on profiles;
drop policy if exists "profiles_insert_staff" on profiles;
drop policy if exists "equipos_select" on equipos;
drop policy if exists "equipos_insert" on equipos;
drop policy if exists "equipos_update_staff" on equipos;
drop policy if exists "equipos_delete_staff" on equipos;
drop policy if exists "historial_select" on historial_estados;
drop policy if exists "historial_insert_staff" on historial_estados;
drop policy if exists "historial_delete_staff" on historial_estados;
drop policy if exists "notificaciones_select" on notificaciones;
drop policy if exists "notificaciones_insert_staff" on notificaciones;
drop policy if exists "notificaciones_delete_staff" on notificaciones;
drop policy if exists "talleres_select_propio" on talleres;
drop policy if exists "profiles_select" on profiles;
drop policy if exists "historial_insert" on historial_estados;

-- TALLERES: cada usuario puede leer los datos de su propio taller.
-- (Crear/editar talleres se hace solo desde el servidor.)
create policy "talleres_select_propio" on talleres for select
  using (id = mi_taller_sin_filtro());

-- PROFILES: cada uno ve su perfil; el staff ve los de SU taller.
-- Altas y cambios de perfiles se hacen solo desde el servidor
-- (así nadie puede cambiarse el rol ni el taller a sí mismo).
create policy "profiles_select" on profiles for select
  using (id = auth.uid() or (is_staff() and taller_id = mi_taller()));

-- EQUIPOS: todo limitado al taller propio.
create policy "equipos_select" on equipos for select
  using (taller_id = mi_taller() and (cliente_id = auth.uid() or is_staff()));
create policy "equipos_insert" on equipos for insert
  with check (taller_id = mi_taller() and (cliente_id = auth.uid() or is_staff()));
create policy "equipos_update_staff" on equipos for update
  using (is_staff() and taller_id = mi_taller())
  with check (taller_id = mi_taller());
create policy "equipos_delete_staff" on equipos for delete
  using (is_staff() and taller_id = mi_taller());

-- HISTORIAL y NOTIFICACIONES: se heredan del equipo (si no podés ver
-- el equipo, no podés ver ni tocar su historial).
create policy "historial_select" on historial_estados for select
  using (exists (select 1 from equipos e where e.id = equipo_id));
create policy "historial_insert" on historial_estados for insert
  with check (
    exists (select 1 from equipos e where e.id = equipo_id)
    and (is_staff() or estado = 'registrado')
  );
create policy "historial_delete_staff" on historial_estados for delete
  using (is_staff() and exists (select 1 from equipos e where e.id = equipo_id));

create policy "notificaciones_select" on notificaciones for select
  using (exists (select 1 from equipos e where e.id = equipo_id));
create policy "notificaciones_insert_staff" on notificaciones for insert
  with check (is_staff() and exists (select 1 from equipos e where e.id = equipo_id));
create policy "notificaciones_delete_staff" on notificaciones for delete
  using (is_staff() and exists (select 1 from equipos e where e.id = equipo_id));

-- 7) STORAGE: bucket público para logos y banners de cada taller
insert into storage.buckets (id, name, public)
values ('talleres-branding', 'talleres-branding', true)
on conflict (id) do nothing;

drop policy if exists "branding_lectura_publica" on storage.objects;
create policy "branding_lectura_publica" on storage.objects for select
  using (bucket_id = 'talleres-branding');

commit;
