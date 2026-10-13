// Aviso visible cuando el mail al cliente no se pudo enviar.
export default function AvisoEmail({ mensaje }) {
  if (!mensaje) return null;
  return (
    <div className="rounded-lg p-3 mt-3 bg-bad/10 border border-bad/40 text-xs text-bad">
      <div className="font-bold mb-0.5">⚠ El cliente NO recibió el aviso por mail</div>
      <div className="text-ink/80">{mensaje}</div>
    </div>
  );
}
