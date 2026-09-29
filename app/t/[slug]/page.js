import { redirect } from "next/navigation";

// Link corto de cada taller: /t/<slug> lleva al login con su marca.
export default function TallerLinkPage({ params }) {
  redirect(`/login?t=${encodeURIComponent(params.slug)}`);
}
