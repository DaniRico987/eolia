import { LogOut } from "lucide-react";
import EoliaLogo from "./EoliaLogo";
/** @typedef {import("../types").Usuario} Usuario */

/** @param {{ usuario: Usuario; onLogout: () => void }} props */
export default function Navbar({ usuario, onLogout }) {
  return (
    <nav className="bg-verde-musgo text-crema px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-subtle">
      <div className="flex items-center gap-3">
        <EoliaLogo
          className="h-14 sm:h-14 w-auto"
          fallbackClassName="text-2xl"
        />
      </div>
      <div className="flex items-center gap-4">
        <span
          className="text-xs sm:text-sm opacity-90 truncate"
          title={`$${usuario.nombre} — $${usuario.rol}`}
        >
          {usuario.nombre}
        </span>
        <button
          onClick={onLogout}
          className="p-2 hover:bg-verde-oliva transition-colors rounded-lg"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
