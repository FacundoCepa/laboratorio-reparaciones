import nodemailer from "nodemailer";
import { Resend } from "resend";
import { MSG_ESTADO, estadoInfo } from "./estados";
import { SISTEMA } from "./config";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Si están cargadas las variables de Gmail, se manda por ahí (no necesita
// dominio propio). Si no, se prueba con Resend. Si no hay nada, solo se
// registra en consola (no rompe el flujo).
const gmailTransport =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    : null;

export const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const casoNum = (n) => String(n).padStart(5, "0");

// Nombre que ve el cliente como remitente (el del taller).
function nombreRemitente(taller) {
  const n = taller?.nombre_corto || taller?.nombre || SISTEMA.nombre;
  return n.replace(/["<>]/g, "");
}

// Envuelve el contenido con el encabezado y pie del taller.
export function plantillaEmail(taller, titulo, cuerpoHtml, colorTitulo = "#E8873A") {
  const contacto = [taller?.telefono && `Tel: ${esc(taller.telefono)}`, taller?.whatsapp && `WhatsApp: ${esc(taller.whatsapp)}`, taller?.direccion && esc(taller.direccion)]
    .filter(Boolean)
    .join(" · ");
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <p style="font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#999; margin-bottom:4px;">${esc(taller?.nombre || SISTEMA.nombre)}</p>
      <h2 style="color:${colorTitulo}; margin-top:0;">${titulo}</h2>
      ${cuerpoHtml}
      ${contacto ? `<p style="font-size:11px; color:#999; margin-top:28px; border-top:1px solid #eee; padding-top:8px;">${contacto}</p>` : ""}
    </div>
  `;
}

// Función genérica. "taller" define el nombre del remitente y a quién le
// llegan las respuestas (el email del taller).
export async function enviarEmail({ to, subject, html, taller }) {
  const replyTo = taller?.email || undefined;

  if (gmailTransport) {
    try {
      await gmailTransport.sendMail({
        from: `"${nombreRemitente(taller)}" <${process.env.GMAIL_USER}>`,
        replyTo,
        to,
        subject,
        html,
      });
      return { sent: true };
    } catch (err) {
      console.error("Error enviando email por Gmail:", err);
      return { error: err.message, code: err.code, responseCode: err.responseCode };
    }
  }

  if (resend) {
    try {
      const fromAddr = process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || process.env.EMAIL_FROM || "notificaciones@tu-dominio.com";
      await resend.emails.send({
        from: `${nombreRemitente(taller)} <${fromAddr}>`,
        replyTo,
        to,
        subject,
        html,
      });
      return { sent: true };
    } catch (err) {
      console.error("Error enviando email por Resend:", err);
      return { error: err.message };
    }
  }

  console.log(`[email simulado] Para: ${to} — ${subject}`);
  return { skipped: true, simulated: true };
}

// Email de cambio de estado para el cliente.
export async function enviarNotificacionEstado({ email, nombre, numero, estado, taller }) {
  const texto = MSG_ESTADO[estado] ? MSG_ESTADO[estado](nombre, numero) : null;
  if (!texto) return { skipped: true };

  return enviarEmail({
    to: email,
    taller,
    subject: `${nombreRemitente(taller)} — Actualización de tu equipo (Caso #${casoNum(numero)})`,
    html: plantillaEmail(
      taller,
      `Caso #${casoNum(numero)}`,
      `<p style="font-size:15px; color:#222;">${esc(texto)}</p>
       <p style="font-size:12px; color:#888; margin-top: 24px;">Estado actual: <b>${estadoInfo(estado).label}</b></p>`
    ),
  });
}

// Avisa a todo el staff (admin/técnicos) de UN taller.
export async function avisarStaffDelTaller(admin, taller, subject, html) {
  const { data: staff } = await admin
    .from("profiles")
    .select("email")
    .eq("taller_id", taller.id)
    .in("role", ["admin", "tecnico"]);
  for (const s of staff || []) {
    if (s.email) await enviarEmail({ to: s.email, subject, html, taller });
  }
}

export { nombreRemitente };

// Traduce el resultado de un envío a un aviso entendible para el staff.
// Devuelve null si el mail salió bien.
export function avisoEnvio(res, destinatario) {
  if (!res || res.sent) return null;
  if (res.skipped && !res.simulated) return null;
  if (res.simulated) {
    return "El envío de mails no está configurado (faltan GMAIL_USER / GMAIL_APP_PASSWORD en Vercel). No se mandó nada.";
  }
  const m = `${res.error || ""}`;
  if (res.code === "EAUTH" || res.responseCode === 535 || /Invalid login|Username and Password not accepted/i.test(m)) {
    return "Gmail rechazó la contraseña de aplicación. Probablemente se cambió la clave de la cuenta de Google o se revocó la contraseña de aplicación: hay que generar una nueva y cargarla en Vercel (GMAIL_APP_PASSWORD).";
  }
  if (/limit|quota|5\.4\.5|exceeded/i.test(m)) {
    return "Gmail bloqueó el envío por límite diario de mails. Se libera solo en 24 horas.";
  }
  if (res.responseCode === 550 || /recipient|address|mailbox/i.test(m)) {
    return `Gmail no aceptó la dirección ${destinatario}. Revisá que el email del cliente esté bien escrito.`;
  }
  return `No se pudo mandar el mail a ${destinatario}: ${m}`;
}

// Qué guardar en "canal" de la notificación según cómo salió el envío.
export function canalEnvio(res) {
  if (res?.sent) return "email";
  if (res?.simulated) return "email-no-configurado";
  return "email-fallido";
}
