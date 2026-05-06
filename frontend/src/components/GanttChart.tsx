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
                          <div
                            onClick={() => setTareaSeleccionada(bar.tarea)}
                            role="button"
                            tabIndex={0}
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

      {/* modal */}
    </>
  );
}
