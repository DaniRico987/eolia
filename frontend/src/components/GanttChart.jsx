import { useState } from "react";
import { X, Droplets, Sprout, Wheat, Leaf, Eye } from "lucide-react";

/** @typedef {import("../types").Tarea} Tarea */
/** @typedef {import("lucide-react").LucideIcon} LucideIcon */

/** @typedef {{
 *   id: string;
 *   nombre: string;
 *   bars: Array<{
 *     id: number;
 *     tarea: Tarea & { recurso?: string };
 *     nombre: string;
 *     startTime: number;
 *     endTime: number;
 *     leftPct: number;
 *     widthPct: number;
 *     progressLabel: string;
 *     color: string;
 *   }>;
 * }} GanttRow */

/** @type {Record<Tarea["tipo"], LucideIcon>} */
const ICONOS_TIPO = {
  riego: Droplets,
  fumigacion: Sprout,
  cosecha: Wheat,
  fertilizacion: Leaf,
  monitoreo: Eye,
};

/** @param {{ tarea: Tarea & { recurso?: string }; onClose: () => void }} props */
function TaskDetailModal({ tarea, onClose }) {
  const IconComponent = ICONOS_TIPO[tarea.tipo] || Eye;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card bg-blanco-hueso max-w-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconComponent
              size={24}
              className="text-dorado-trigo flex-shrink-0"
            />
            <div className="min-w-0">
              <h3
                className="font-fraunces font-bold text-lg text-tierra-oscura truncate"
                title={tarea.nombre}
              >
                {tarea.nombre}
              </h3>
              <p className="text-xs text-tierra-oscura opacity-60 capitalize">
                {tarea.tipo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-arena transition-colors rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-arena rounded-lg p-3">
              <p className="text-xs text-tierra-oscura opacity-60 mb-1">
                Duración
              </p>
              <p className="text-lg font-semibold text-verde-musgo">
                {tarea.duracion}h
              </p>
            </div>
            <div className="bg-arena rounded-lg p-3">
              <p className="text-xs text-tierra-oscura opacity-60 mb-1">
                Prioridad
              </p>
              <p className="text-lg font-semibold text-dorado-trigo">
                ⭐ {tarea.prioridad}
              </p>
            </div>
          </div>

          <div className="bg-arena rounded-lg p-3 border border-dorado-trigo/20">
            <p className="text-xs text-tierra-oscura opacity-60 mb-2 font-medium">
              Horario de Ejecución
            </p>
            <div className="space-y-1">
              <p className="text-sm text-tierra-oscura">
                <span className="font-medium">Llegada:</span> {tarea.llegada}h
              </p>
              <p className="text-sm text-tierra-oscura">
                <span className="font-medium">Inicio:</span> {tarea.inicio}h
              </p>
              <p className="text-sm text-tierra-oscura">
                <span className="font-medium">Fin:</span> {tarea.fin}h
              </p>
              <p className="text-sm text-tierra-oscura">
                <span className="font-medium">Recurso:</span>{" "}
                {tarea.recurso || "ninguno"}
              </p>
            </div>
          </div>

          <div className="bg-verde-musgo/5 rounded-lg p-3 border border-verde-musgo/20">
            <p className="text-xs text-tierra-oscura opacity-60 mb-2 font-medium">
              Métricas
            </p>
            <div className="space-y-1">
              <p className="text-sm text-tierra-oscura">
                <span className="font-medium">Espera:</span>{" "}
                {tarea.tiempo_espera}h
              </p>
              <p className="text-sm text-tierra-oscura">
                <span className="font-medium">Retorno:</span>{" "}
                {tarea.tiempo_retorno}h
              </p>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="btn-primary w-full mt-4">
          Cerrar
        </button>
      </div>
    </div>
  );
}

/** @param {{ rows: GanttRow[]; currentTime: number; totalTime: number }} props */
export default function GanttChart({ rows, currentTime, totalTime }) {
  const [tareaSeleccionada, setTareaSeleccionada] = useState(
    /** @type {(Tarea & { recurso?: string }) | null} */ (null),
  );

  if (!rows || rows.length === 0) return null;

  const rango = Math.max(1, totalTime || 0);
  const tiempoActualPct = Math.min(
    100,
    (Math.max(0, currentTime) / rango) * 100,
  );

  return (
    <>
      <div className="card">
        <h3 className="font-fraunces font-bold text-tierra-oscura mb-2 flex items-center gap-2">
          📊 Diagrama de Gantt en vivo
        </h3>
        <p className="text-xs text-tierra-oscura opacity-60 mb-4">
          Las barras aparecen y crecen a medida que avanza el reloj simulado
        </p>
        <div className="overflow-x-auto">
          <div className="min-w-[760px] space-y-3">
            <div className="grid grid-cols-[160px_1fr] gap-3 items-end">
              <div />
              <div className="flex items-center justify-between text-xs text-tierra-oscura/60 font-medium px-1">
                <span>0</span>
                <span>Tiempo simulado</span>
                <span>{rango}h</span>
              </div>
            </div>

            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[160px_1fr] gap-3 items-start"
              >
                <div className="pt-3">
                  <p
                    className="text-sm font-semibold text-tierra-oscura truncate"
                    title={row.nombre}
                  >
                    {row.nombre}
                  </p>
                </div>
                <div className="relative h-16 rounded-2xl bg-arena/70 overflow-hidden border border-arena">
                  <div
                    className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgba(59,82,51,0.12) 1px, transparent 1px)",
                      backgroundSize: `${100 / Math.max(1, Math.min(rango, 12))}% 100%`,
                    }}
                  />

                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-dorado-trigo/80 pointer-events-none"
                    style={{ left: `${tiempoActualPct}%` }}
                  >
                    <span className="absolute -top-5 -translate-x-1/2 text-[10px] font-semibold text-dorado-trigo whitespace-nowrap">
                      T = {currentTime}
                    </span>
                  </div>

                  {row.bars.map((bar) => (
                    <button
                      key={bar.id}
                      onClick={() => setTareaSeleccionada(bar.tarea)}
                      className="absolute top-2 bottom-2 rounded-xl flex items-center justify-center text-blanco-hueso text-xs font-medium whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden"
                      style={{
                        left: `${bar.leftPct}%`,
                        width: `${Math.max(bar.widthPct, bar.widthPct > 0 ? 4 : 0)}%`,
                        backgroundColor: bar.color,
                        transition:
                          "width 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
                      }}
                      title={`Clic para ver detalles: ${bar.nombre}`}
                    >
                      <span
                        className={`px-2 text-left leading-tight ${bar.widthPct < 12 ? "opacity-0" : "opacity-100"}`}
                      >
                        {bar.nombre}
                        <span className="block text-[10px] font-normal opacity-80">
                          {bar.progressLabel}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between text-xs text-tierra-oscura opacity-60 mt-3 font-medium">
          <span>0h</span>
          <span>{rango}h</span>
        </div>
      </div>

      {tareaSeleccionada && (
        <TaskDetailModal
          tarea={tareaSeleccionada}
          onClose={() => setTareaSeleccionada(null)}
        />
      )}
    </>
  );
}
