import React from "react";
import { Droplets, Tractor, Sprout, CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONOS: Record<string, LucideIcon> = {
  bomba_agua: Droplets,
  tractor: Tractor,
  equipo_fumigador: Sprout,
  ninguno: CheckCircle,
};

const formatRecurso = (recurso: string) =>
  recurso
    .replace(/_/g, " ")
    .split(" ")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");

interface Recurso {
  id: string;
  nombre: string;
  estado: string;
  detalle: string;
  tareaActual?: { nombre: string } | null;
  cola?: Array<{ nombre: string }>;
}

export default function RecursoStatus({ recursos }: { recursos: Recurso[] }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {recursos.map((recurso) => {
        const IconComponent = ICONOS[recurso.id] || Sprout;
        const estadoNormalizado = recurso.estado.toLowerCase();
        const esLibre = estadoNormalizado === "libre";
        const esCola = estadoNormalizado === "en cola";

        const contenedorClase = esLibre
          ? "bg-green-50 border-green-200"
          : esCola
            ? "bg-amber-50 border-amber-300"
            : "bg-red-50 border-red-300";

        const badgeClase = esLibre
          ? "bg-green-100 text-verde-musgo"
          : esCola
            ? "bg-amber-100 text-dorado-trigo"
            : "bg-red-100 text-red-700";

        return (
          <div
            key={recurso.id}
            className={`card flex items-center justify-between gap-3 ${contenedorClase}`}
            style={{
              transition:
                "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <IconComponent
                size={22}
                className="text-verde-musgo flex-shrink-0"
              />
              <div className="min-w-0">
                <p
                  className="text-xs text-tierra-oscura opacity-70"
                  title={formatRecurso(recurso.id)}
                >
                  {recurso.nombre}
                </p>
                <p className="text-[11px] text-tierra-oscura/70 truncate">
                  {recurso.detalle}
                </p>
              </div>
            </div>
            <span
              title={
                esLibre
                  ? "Disponible"
                  : esCola
                    ? "En cola"
                    : `Ocupado${recurso.tareaActual ? ` por ${recurso.tareaActual.nombre}` : ""}`
              }
              className={`${badgeClase} px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300`}
            >
              {recurso.estado}
            </span>
          </div>
        );
      })}
    </div>
  );
}
