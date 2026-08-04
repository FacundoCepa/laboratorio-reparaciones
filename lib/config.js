export const NEGOCIO = {
  nombre: "FcepaComputación & Argentina Express",
  nombreCorto: "FcepaComputación",
  emoji: "🔧",
  tiendaUrl: "https://argentinaexpress.mitiendanube.com/",
};

// Banners promocionales que se muestran a los clientes una vez logueados.
// Para agregar más: subí la imagen a /public y agregá una línea acá.
// Se van rotando solos cada 6 segundos si hay más de uno.
export const BANNERS = [
  {
    image: "/logo-argentina-express.webp",
    alt: "Argentina Express - FcepaComputación",
    href: NEGOCIO.tiendaUrl,
  },
];
