import { Resend } from "resend";
import { MSG_ESTADO, estadoInfo } from "./estados";
import { NEGOCIO } from "./config";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Envía el email de cambio de estado. Si no hay API key configurada
// (por ejemplo en desarrollo), simplemente lo deja registrado en consola
// para no romper el flujo.
export async function enviarNotificacionEstado({ email, nombre, numero, estado }) {
  const texto = MSG_ESTADO[estado] ? MSG_ESTADO[estado](nombre, numero) : null;
  if (!texto) return { skipped: true };

  if (!resend) {
    console.log(`[email simulado] Para: ${email} — ${texto}`);
    return { skipped: true, simulated: true };
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || `${NEGOCIO.nombreCorto} <notificaciones@tu-dominio.com>`,
      to: email,
      subject: `${NEGOCIO.nombreCorto} — Actualización de tu equipo (Caso #${String(numero).padStart(5, "0")})`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <p style="font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#999; margin-bottom:4px;">${NEGOCIO.nombre}</p>
          <h2 style="color:#E8873A; margin-top:0;">Caso #${String(numero).padStart(5, "0")}</h2>
          <p style="font-size:15px; color:#222;">${texto}</p>
          <p style="font-size:12px; color:#888; margin-top: 24px;">Estado actual: <b>${estadoInfo(estado).label}</b></p>
        </div>
      `,
    });
    return { sent: true };
  } catch (err) {
    console.error("Error enviando email:", err);
    return { error: err.message };
  }
}
