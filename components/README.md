# Sistema de gestión de reparaciones — Guía de puesta en marcha

Esta es la versión real (no el prototipo) del sistema: login de verdad,
base de datos, fotos guardadas de forma permanente y emails automáticos
en cada cambio de estado. Está pensada para desplegarse gratis (o casi)
en Vercel + Supabase + Resend.

No hace falta saber programar para seguir estos pasos, pero sí ir con
calma la primera vez. Se hace una sola vez.

---

## 0) Qué vas a necesitar

- Una cuenta de [GitHub](https://github.com) (gratis)
- Una cuenta de [Vercel](https://vercel.com) (gratis, te podés loguear con GitHub)
- Una cuenta de [Supabase](https://supabase.com) (gratis)
- Una cuenta de [Resend](https://resend.com) (gratis hasta 3.000 emails/mes)
- Un dominio propio (opcional al principio — podés arrancar con la URL
  gratuita que te da Vercel, tipo `laboratorio.vercel.app`, y comprar el
  dominio más adelante sin tener que tocar nada de esto)

### Dónde comprar el dominio (cuando quieras)
- **Namecheap** (namecheap.com): dominios `.com` internacionales, ~10-15 USD/año
- **NIC Argentina** (nic.ar): dominios `.com.ar`, ~ pesos, trámite 100% local
- Cualquiera de las dos funciona igual de bien con Vercel.

---

## 1) Subir el código a GitHub

1. Entrá a GitHub → **New repository** → nombre: `laboratorio-reparaciones` → **Create repository**
2. En tu computadora, dentro de esta carpeta, corré:
   ```bash
   git init
   git add .
   git commit -m "Primera versión"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/laboratorio-reparaciones.git
   git push -u origin main
   ```

---

## 2) Crear el proyecto en Supabase (base de datos + login + fotos)

1. Entrá a [supabase.com](https://supabase.com) → **New project**
2. Elegí un nombre, una contraseña de base de datos (guardala) y la región
   más cercana (por ejemplo `South America (São Paulo)`)
3. Cuando el proyecto esté listo, andá a **SQL Editor** → **New query**
4. Abrí el archivo `supabase/schema.sql` de esta carpeta, copiá todo su
   contenido, pegalo ahí y tocá **Run**. Esto crea todas las tablas,
   la numeración automática de casos y los permisos de seguridad.
5. Andá a **Project Settings → API** y copiá estos tres valores (los vas
   a necesitar en el paso 4):
   - `Project URL`
   - `anon public` key
   - `service_role` key (⚠️ esta es secreta, nunca la compartas ni la
     subas a GitHub)

### Crear tu primer usuario administrador
1. Andá a **Authentication → Users → Add user**, cargá tu email y una
   contraseña, y confirmá.
2. Copiá el UUID que te genera ese usuario.
3. Volvé a **SQL Editor** y corré (reemplazando los datos):
   ```sql
   insert into profiles (id, role, nombre, email)
   values ('PEGAR-UUID-ACA', 'admin', 'Tu Nombre', 'tu@email.com');
   ```
4. Con ese email y contraseña vas a poder entrar al sistema como
   administrador. Para crear técnicos, repetís lo mismo con `role = 'tecnico'`.
   Los clientes se crean solos desde la pantalla "Cargar equipo" cuando
   el staff registra un equipo nuevo (no hace falta hacerlo a mano).

---

## 3) Crear la cuenta de Resend (para los emails)

1. Entrá a [resend.com](https://resend.com) → creá cuenta
2. Si ya tenés dominio propio: **Domains → Add Domain**, seguís las
   instrucciones (agregar unos registros DNS) para poder mandar emails
   desde `notificaciones@tu-dominio.com`
3. Si todavía no tenés dominio: podés probar igual usando el dominio de
   prueba que te da Resend, y cambiarlo después sin tocar código
4. Andá a **API Keys → Create API Key** y copiala

---

## 4) Desplegar en Vercel

1. Entrá a [vercel.com](https://vercel.com) → **Add New → Project**
2. Elegí el repositorio `laboratorio-reparaciones` que subiste a GitHub
3. En **Environment Variables**, cargá estas (con los valores reales de
   los pasos anteriores):

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | el Project URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la anon key de Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | la service role key de Supabase |
   | `RESEND_API_KEY` | tu API key de Resend |
   | `EMAIL_FROM` | `Laboratorio <notificaciones@tu-dominio.com>` |

4. Tocá **Deploy** y esperá unos minutos. Al terminar te da una URL tipo
   `laboratorio-reparaciones.vercel.app` — ya está online y funcionando.

### Conectar tu dominio propio (cuando lo tengas)
1. En Vercel: **Project → Settings → Domains → Add**
2. Escribí tu dominio (ej. `laboratoriotecno.com.ar`)
3. Vercel te muestra 1 o 2 registros DNS para agregar en el panel de tu
   proveedor de dominio (Namecheap, NIC.ar, etc.) — normalmente un
   registro `A` y/o `CNAME`. Los agregás ahí y en unos minutos/horas
   (a veces hasta 24hs) el dominio queda apuntando solo.

---

## 5) Probar todo

1. Entrá a tu URL, iniciá sesión con el usuario admin que creaste
2. Andá a **Cargar equipo**, creá un cliente nuevo de prueba (usá tu
   propio email para verlo llegar)
3. Marcá el equipo como **ingresado** y después **avanzá el estado** un
   par de veces — deberías recibir el email en la casilla que usaste
4. Iniciá sesión con las credenciales del cliente de prueba para ver la
   vista de seguimiento

---

## Qué quedó pendiente / próximos pasos posibles

- **WhatsApp real**: hoy las notificaciones van por email. Para sumar
  WhatsApp hay que dar de alta una cuenta de WhatsApp Business API
  (directo con Meta, o más simple a través de Twilio) — cuando quieras
  avanzar con eso lo conectamos a la misma función que ya envía los
  emails (`lib/email.js` / `cambiarEstado`).
- **Presupuestos con monto**: se puede agregar un campo de monto y un
  botón de "aceptar/rechazar presupuesto" para que el cliente responda
  desde su propia pantalla.
- **La etiqueta imprimible** (`/etiqueta/[id]`) se abre con un link
  directo sin pedir login, para que cualquiera en el mostrador la pueda
  imprimir rápido desde el celu. El link no es adivinable (usa un
  código largo), pero si preferís que pida login igual, es un cambio
  chico en `middleware.js`.
- **Impresoras térmicas de etiquetas**: la página de etiqueta ya viene
  con el tamaño pensado para una impresora de tickets; si usás una
  impresora térmica específica (Zebra, Brother, etc.) puede necesitar
  un ajuste fino de tamaño en `app/etiqueta/[id]/page.js`.

Cualquier ajuste de estos (o algo nuevo) lo seguimos charlando cuando
quieras.
