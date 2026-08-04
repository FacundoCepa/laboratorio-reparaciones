-- ============================================================
-- Esquema del Sistema de Gestión de Reparaciones
-- Ejecutar completo en: Supabase → SQL Editor → New query
-- ============================================================

-- 1) PERFILES (extiende auth.users con rol, nombre, teléfono)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'cliente' check (role in ('admin', 'tecnico', 'cliente')),
  nombre text not null,
  email text,
  telefono text,
  creado_at timestamptz not null default now()
);

-- 2) SECUENCIA para el número de caso, prolija y correlativa
create sequence if not exists equipos_numero_seq start 1;

-- 3) EQUIPOS
create table if not exists equipos (
  id uuid primary key default gen_random_uuid(),
  numero integer not null default nextval('equipos_numero_seq'),
  cliente_id uuid not null references profiles(id) on delete cascade,
  tipo text not null,
  marca text not null,
  modelo text not null,
  serial text not null,
  falla text,
  bateria text not null default 'no_tiene' check (bateria in ('si', 'interna', 'no_tiene')),
  cargador boolean not null default false,
  memoria boolean not null default false,
  disco boolean not null default false,
  teclado boolean not null default false,
  foto_frente_url text,
  foto_reverso_url text,
  estado text not null default 'registrado' check (estado in (
    'registrado','recibido','revision','reparacion','presupuesto',
    'espera_presupuesto','reparado','finalizado','entrega'
  )),
  creado_at timestamptz not null default now()
);
create index if not exists equipos_cliente_idx on equipos(cliente_id);
create index if not exists equipos_estado_idx on equipos(estado);

-- 4) HISTORIAL DE ESTADOS (para el riel de progreso)
create table if not exists historial_estados (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references equipos(id) on delete cascade,
  estado text not null,
  fecha timestamptz not null default now()
);
create index if not exists historial_equipo_idx on historial_estados(equipo_id);

-- 5) NOTIFICACIONES enviadas (registro de lo que se le mandó al cliente)
create table if not exists notificaciones (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references equipos(id) on delete cascade,
  texto text not null,
  canal text not null default 'email',
  fecha timestamptz not null default now()
);
create index if not exists notificaciones_equipo_idx on notificaciones(equipo_id);

-- ============================================================
-- FUNCIÓN HELPER: ¿el usuario actual es staff (admin o técnico)?
-- ============================================================
create or replace function is_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'tecnico')
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table equipos enable row level security;
alter table historial_estados enable row level security;
alter table notificaciones enable row level security;

-- PROFILES: cada uno ve su propio perfil; el staff ve todos
create policy "profiles_select_propio" on profiles for select
  using (id = auth.uid() or is_staff());
create policy "profiles_update_propio" on profiles for update
  using (id = auth.uid());
create policy "profiles_insert_staff" on profiles for insert
  with check (is_staff() or id = auth.uid());

-- EQUIPOS: el staff ve y edita todo; el cliente solo lo suyo
create policy "equipos_select" on equipos for select
  using (cliente_id = auth.uid() or is_staff());
create policy "equipos_insert" on equipos for insert
  with check (cliente_id = auth.uid() or is_staff());
create policy "equipos_update_staff" on equipos for update
  using (is_staff());

-- HISTORIAL: mismo criterio, a través del equipo
create policy "historial_select" on historial_estados for select
  using (
    exists (select 1 from equipos e where e.id = equipo_id and (e.cliente_id = auth.uid() or is_staff()))
  );
create policy "historial_insert_staff" on historial_estados for insert
  with check (is_staff());

-- NOTIFICACIONES: mismo criterio
create policy "notificaciones_select" on notificaciones for select
  using (
    exists (select 1 from equipos e where e.id = equipo_id and (e.cliente_id = auth.uid() or is_staff()))
  );
create policy "notificaciones_insert_staff" on notificaciones for insert
  with check (is_staff());

-- ============================================================
-- STORAGE: bucket para las fotos de los equipos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('equipos-fotos', 'equipos-fotos', true)
on conflict (id) do nothing;

create policy "fotos_lectura_publica" on storage.objects for select
  using (bucket_id = 'equipos-fotos');
create policy "fotos_subida_autenticados" on storage.objects for insert
  with check (bucket_id = 'equipos-fotos' and auth.role() = 'authenticated');

-- ============================================================
-- USUARIO INICIAL DE PRUEBA (admin)
-- Después de correr este script:
-- 1. Andá a Authentication → Users → Add user, creá tu primer admin
--    (por ejemplo tu propio email) con una contraseña.
-- 2. Copiá el UUID que te genera y corré esto reemplazando los valores:
--
-- insert into profiles (id, role, nombre, email)
-- values ('PEGAR-UUID-ACA', 'admin', 'Tu Nombre', 'tu@email.com');
-- ============================================================
