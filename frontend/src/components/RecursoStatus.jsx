import { Droplets, Tractor, Sprout, CheckCircle } from "lucide-react";

/** @typedef {import("../types").RecursoMapa} RecursoMapa */
/** @typedef {import("lucide-react").LucideIcon} LucideIcon */

/** @type {Record<string, LucideIcon>} */
const ICONOS = {
  bomba_agua: Droplets,
  tractor: Tractor,
  equipo_fumigador: Sprout,
  ninguno: CheckCircle,
};

/** @param {string} recurso */
const formatRecurso = (recurso) =>
  recurso
    .replace("_", " ")
    .split(" ")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");

/** @param {{ recursos: RecursoMapa }} props */
export default function RecursoStatus({ recursos }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {Object.entries(recursos).map(([recurso, estado]) => {
        const IconComponent = ICONOS[recurso] || Sprout;
        const esLibre = estado === "libre";

        return (
          <div key={recurso} className="card flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <IconComponent
                size={22}
                className="text-verde-musgo flex-shrink-0"
              />
              <div className="min-w-0">
                <p
                  className="text-xs text-tierra-oscura opacity-70"
                  title={formatRecurso(recurso)}
                >
                  {formatRecurso(recurso)}
                </p>
              </div>
            </div>
            <span
              title={esLibre ? "Disponible" : `En uso: ${estado}`}
              className={esLibre ? "badge-free" : "badge-busy"}
            >
              {esLibre ? "Libre" : `Usando: ${estado}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
