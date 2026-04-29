import { useState } from "react";
import { X, Droplets, Sprout, Wheat, Leaf, Eye } from "lucide-react";

/** @typedef {import("../types").Tarea} Tarea */
/** @typedef {import("lucide-react").LucideIcon} LucideIcon */

const COLORES = [
  "#3B5233",
  "#C4922A",
  "#6B7C45",
  "#8B5E3C",
  "#4A6741",
  "#D4A843",
  "#5C7A52",
  "#A0522D",
];

/** @type {Record<Tarea["tipo"], LucideIcon>} */
const ICONOS_TIPO = {
  riego: Droplets,
  fumigacion: Sprout,
  cosecha: Wheat,
  fertilizacion: Leaf,
  monitoreo: Eye,
};

/** @param {{ tarea: Tarea; onClose: () => void }} props */
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

/** @param {{ tareas: Tarea[] }} props */
export default function GanttChart({ tareas }) {
  const [tareaSeleccionada, setTareaSeleccionada] = useState(/** @type {Tarea | null} */ (null));

  if (!tareas || tareas.length === 0) return null;

  const completadas = tareas.filter((t) => t.fin !== null);
  if (completadas.length === 0) return null;

  const minTiempo = Math.min(...completadas.map((t) => t.llegada));
  const maxTiempo = Math.max(...completadas.map((t) => t.fin ?? t.llegada));
  const rango = maxTiempo - minTiempo;

  return (
    <>
      <div className="card">
        <h3 className="font-fraunces font-bold text-tierra-oscura mb-2 flex items-center gap-2">
          📊 Diagrama de Gantt
        </h3>
        <p className="text-xs text-tierra-oscura opacity-60 mb-4">
          Haz clic en una tarea para ver detalles
        </p>
        <div className="space-y-2 min-w-full overflow-x-auto">
          {completadas.map((tarea, i) => {
            const offsetPct = (((tarea.inicio ?? tarea.llegada) - minTiempo) / rango) * 100;
            const widthPct = (tarea.duracion / rango) * 100;
            return (
              <div key={tarea.id} className="flex items-center gap-3">
                <span
                  className="text-xs sm:text-sm text-tierra-oscura font-medium w-24 sm:w-32 truncate"
                  title={tarea.nombre}
                >
                  {tarea.nombre}
                </span>
                <div className="flex-1 min-w-0 bg-arena rounded-full h-6 sm:h-7 relative">
                  <button
                    onClick={() => setTareaSeleccionada(tarea)}
                    className="absolute h-6 sm:h-7 rounded-full flex items-center justify-center text-blanco-hueso text-xs font-medium whitespace-nowrap hover:shadow-subtle hover:scale-105 transition-all cursor-pointer"
                    style={{
                      left: `${offsetPct}%`,
                      width: `${Math.max(widthPct, 5)}%`,
                      backgroundColor: COLORES[i % COLORES.length],
                    }}
                    title={`Clic para ver detalles: ${tarea.nombre}`}
                  >
                    {tarea.duracion}h
                  </button>
                </div>
                <span
                  className="text-xs text-tierra-oscura opacity-60 w-14 sm:w-16 text-right flex-shrink-0 font-medium"
                  title={`$${tarea.inicio ?? tarea.llegada}→$${tarea.fin}`}
                >
                  {tarea.inicio ?? tarea.llegada}→{tarea.fin}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-tierra-oscura opacity-60 mt-3 font-medium">
          <span>{minTiempo}h</span>
          <span>{maxTiempo}h</span>
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
