"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NEGOCIO } from "@/lib/config";

export default function Header({ nombre, role }) {
  const pathname = usePathname();
  const router = useRouter();
  const isStaff = role === "admin" || role === "tecnico";

  const staffTabs = [
    { href: "/panel", label: "Panel" },
    { href: "/cargar", label: "Cargar equipo" },
    { href: "/equipos", label: "Equipos" },
    { href: "/historial", label: "Historial" },
  ];
  const clientTabs = [
    { href: "/mis-equipos", label: "Mis equipos" },
    { href: "/cargar", label: "Registrar equipo" },
  ];
  const tabs = isStaff ? staffTabs : clientTabs;

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="border-b border-border bg-[#211F1C] sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <div className="font-bold text-ink text-sm">
          {NEGOCIO.emoji} {NEGOCIO.nombreCorto}
        </div>
        <div className="flex items-center gap-1 bg-bg p-1 rounded-lg border border-border2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                pathname === t.href ? "bg-accent text-bg" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-ink">{nombre}</div>
            <div className="text-[10px] text-dim uppercase">{role}</div>
          </div>
          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-bad hover:border-[#5c3a35]"
            title="Cerrar sesión"
          >
            ⏻
          </button>
        </div>
      </div>
    </div>
  );
}
