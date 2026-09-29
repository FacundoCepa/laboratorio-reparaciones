// Muestra el logo del taller; si no cargó logo, muestra el nombre.
export default function LogoTaller({ taller, className = "h-16", textClassName = "text-xl" }) {
  if (taller?.logo_url) {
    return <img src={taller.logo_url} alt={taller.nombre} className={`${className} object-contain`} />;
  }
  return (
    <div className={`${textClassName} font-black text-ink text-center leading-tight`}>
      {taller?.nombre_corto || taller?.nombre || "Taller"}
    </div>
  );
}
