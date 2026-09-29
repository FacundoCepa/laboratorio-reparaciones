// Banner que cada taller carga desde "Mi taller" (se muestra a sus clientes).
export default function BannerPromocional({ image, href }) {
  if (!image) return null;
  const img = <img src={image} alt="" className="w-full h-auto block" />;
  return (
    <div className="max-w-md mx-auto px-5 py-6">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="block rounded-lg overflow-hidden border border-border2 hover:border-accent transition"
        >
          {img}
        </a>
      ) : (
        <div className="rounded-lg overflow-hidden border border-border2">{img}</div>
      )}
    </div>
  );
}
