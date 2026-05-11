import React, { useState } from "react";
import { X, Droplets, Sprout, Wheat, Leaf, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tarea } from "../types";

type TareaSimulada = Tarea & { recurso?: string };

type GanttBar = {
  id: number;
  tarea: TareaSimulada;
  nombre: string;
  startTime: number;
  endTime: number;
  leftPct: number;
  widthPct: number;
  progressLabel: string;
  color: string;
};

type GanttRow = { id: string; nombre: string; bars: GanttBar[] };

const ICONOS_TIPO: Record<Tarea["tipo"], LucideIcon> = {
  riego: Droplets,
  fumigacion: Sprout,
  cosecha: Wheat,
  fertilizacion: Leaf,
  monitoreo: Eye,
};

export default function GanttChart({
  rows,
  currentTime,
  totalTime,
}: {
  rows: GanttRow[];
  currentTime: number;
  totalTime: number;
}) {
  const [tareaSeleccionada, setTareaSeleccionada] =
    useState<TareaSimulada | null>(null);
  const [hoveredBarId, setHoveredBarId] = useState<number | null>(null);

  if (!rows || rows.length === 0) return null;

  const rango = Math.max(1, totalTime || 0);
  const tiempoActualPct = Math.min(
    100,
    (Math.max(0, currentTime) / rango) * 100,
  );
  const IconoTareaSeleccionada = tareaSeleccionada
    ? ICONOS_TIPO[tareaSeleccionada.tipo]
    : null;

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

                  {row.bars.map((bar) => {
                    const inicio = bar.startTime;
                    const fin = bar.endTime;
                    const dur = Math.max(1, fin - inicio);
                    const currentWidthPct = Math.max(
                      0,
                      ((Math.min(currentTime, fin) - inicio) / rango) * 100,
                    );
                    const fullWidthPct = (dur / rango) * 100;
                    const containerWidth = Math.max(fullWidthPct, 1);
                    const innerPctOfContainer =
                      fullWidthPct > 0
                        ? (currentWidthPct / containerWidth) * 100
                        : 0;
                    return (
                      <div
                        key={bar.id}
                        className="absolute top-2 bottom-2 rounded-xl overflow-visible group"
                        style={{
                          left: `${bar.leftPct}%`,
                          width: `${containerWidth}%`,
                        }}
                      >
                        <div className="relative h-full rounded-lg bg-arena/40 border border-arena/20 px-0.5">
                          {hoveredBarId === bar.id && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md text-blanco-hueso text-[11px] px-2 py-1 whitespace-nowrap pointer-events-none z-20">
                              {bar.nombre}
                            </div>
                          )}

                          <div
                            onClick={() => setTareaSeleccionada(bar.tarea)}
                            onMouseEnter={() => setHoveredBarId(bar.id)}
                            onMouseLeave={() => setHoveredBarId(null)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setTareaSeleccionada(bar.tarea);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            title={bar.nombre}
                            className={`absolute left-0 top-0 bottom-0 rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none`}
                            style={{
                              width: `${Math.max(innerPctOfContainer, 0)}%`,
                              backgroundColor: bar.color,
                              minWidth: "12px",
                            }}
                          />

                          {currentWidthPct <= 0 && (
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-4 rounded bg-white/70 border border-white/30 shadow-inner" />
                          )}
                        </div>
                      </div>
                    );
                  })}
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
        <div
          className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
          onClick={() => setTareaSeleccionada(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-arena bg-blanco-hueso shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-arena flex items-center justify-between">
              <h4 className="font-fraunces text-lg font-bold text-tierra-oscura flex items-center gap-2">
                {IconoTareaSeleccionada && (
                  <IconoTareaSeleccionada
                    size={18}
                    className="text-verde-oliva"
                  />
                )}
                Detalle de Tarea
              </h4>
              <button
                type="button"
                onClick={() => setTareaSeleccionada(null)}
                className="p-1.5 rounded-lg hover:bg-arena transition-colors"
                aria-label="Cerrar detalle"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 text-sm text-tierra-oscura">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-60">
                  Nombre
                </p>
                <p className="font-semibold mt-0.5">
                  {tareaSeleccionada.nombre}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-60">
                    Tipo
                  </p>
                  <p className="mt-0.5 capitalize">{tareaSeleccionada.tipo}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-60">
                    Recurso
                  </p>
                  <p className="mt-0.5">
                    {tareaSeleccionada.recurso?.replace(/_/g, " ") ?? "Ninguno"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-60">
                    Inicio
                  </p>
                  <p className="mt-0.5">
                    T = {tareaSeleccionada.inicio ?? tareaSeleccionada.llegada}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-60">
                    Fin
                  </p>
                  <p className="mt-0.5">T = {tareaSeleccionada.fin ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-60">
                    Duración
                  </p>
                  <p className="mt-0.5">{tareaSeleccionada.duracion}h</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-60">
                    Prioridad
                  </p>
                  <p className="mt-0.5">{tareaSeleccionada.prioridad}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
