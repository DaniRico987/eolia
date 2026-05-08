import React, { useState } from "react";
import {
  Droplets,
  Sprout,
  Wheat,
  Leaf,
  Eye,
  Trash2,
  Skull,
} from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import type { LucideIcon } from "lucide-react";
import type { Tarea } from "../types";

const ICONOS_TIPO: Record<string, LucideIcon> = {
  riego: Droplets,
  fumigacion: Sprout,
  cosecha: Wheat,
  fertilizacion: Leaf,
  monitoreo: Eye,
};

const ESTADO_META: Record<
  Tarea["estado"],
  { etiqueta: string; clases: string }
> = {
  pendiente: { etiqueta: "Pendiente", clases: "bg-amber-100 text-amber-900" },
  ejecutando: { etiqueta: "En ejecucion", clases: "bg-emerald-100 text-emerald-900" },
  completada: { etiqueta: "Completada", clases: "bg-green-100 text-green-800" },
  interrumpida: { etiqueta: "Interrumpida", clases: "bg-red-100 text-red-800" },
  esperando: { etiqueta: "En espera", clases: "bg-sky-100 text-sky-800" },
};

export default function TareaCard({
  tarea,
  onEliminar,
  puedeEliminar,
  onSeleccionar,
  seleccionada = false,
}: {
  tarea: Tarea;
  onEliminar?: (id: number) => void | Promise<void>;
  puedeEliminar: boolean;
  onSeleccionar?: (tarea: Tarea) => void;
  seleccionada?: boolean;
}) {
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleEliminarClick = async () => {
    setCargando(true);
    try {
      await onEliminar?.(tarea.id);
    } finally {
      setCargando(false);
      setMostrarConfirm(false);
    }
  };

  const IconComponent =
    tarea.tipo === "fumigacion" && tarea.prioridad === 5
      ? Skull
      : ICONOS_TIPO[tarea.tipo] || Eye;

  const metaEstado = ESTADO_META[tarea.estado];
  const esCritica = tarea.prioridad >= 5 || tarea.estado === "interrumpida";

  return (
    <>
      <div
        role={onSeleccionar ? "button" : undefined}
        tabIndex={onSeleccionar ? 0 : undefined}
        onClick={onSeleccionar ? () => onSeleccionar(tarea) : undefined}
        onKeyDown={
          onSeleccionar
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSeleccionar(tarea);
                }
              }
            : undefined
        }
        className={`card transition ${
          onSeleccionar ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""
        } ${
          tarea.estado === "ejecutando"
            ? "border-emerald-200 bg-gradient-to-r from-white to-emerald-50/60"
            : tarea.estado === "interrumpida"
              ? "border-red-200 bg-gradient-to-r from-white to-red-50/60"
              : esCritica
                ? "border-amber-200 bg-gradient-to-r from-white to-amber-50/60"
                : ""
        } ${
          seleccionada ? "ring-2 ring-dorado-trigo ring-offset-2 ring-offset-crema" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="rounded-2xl bg-crema p-2 text-dorado-trigo">
              <IconComponent size={16} />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="truncate text-sm font-medium text-tierra-oscura sm:text-[15px]"
                  title={tarea.nombre}
                >
                  {tarea.nombre}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${metaEstado.clases}`}>
                  {metaEstado.etiqueta}
                </span>
              </div>
              <p className="text-[11px] text-tierra-oscura/55 capitalize">
                {tarea.tipo} · prioridad {tarea.prioridad}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-2 text-[11px] text-tierra-oscura sm:grid-cols-3">
          <div className="rounded-xl bg-crema px-3 py-1.5" title={`${tarea.duracion} horas`}>
            <span className="block text-tierra-oscura/55">Duracion</span>
            <strong>{tarea.duracion}h</strong>
          </div>
          <div className="rounded-xl bg-crema px-3 py-1.5" title={`Prioridad ${tarea.prioridad}`}>
            <span className="block text-tierra-oscura/55">Prioridad</span>
            <strong>{tarea.prioridad}</strong>
          </div>
          <div className="rounded-xl bg-crema px-3 py-1.5" title={`Llegada ${tarea.llegada} horas`}>
            <span className="block text-tierra-oscura/55">Llegada</span>
            <strong>{tarea.llegada}h</strong>
          </div>
        </div>

        {tarea.inicio !== null && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-tierra-oscura">
            <div className="rounded-xl bg-white/80 px-3 py-1.5" title={`Tiempo de espera: ${tarea.tiempo_espera}h`}>
              <span className="block text-tierra-oscura/55">Espera</span>
              <strong>{tarea.tiempo_espera}h</strong>
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-1.5" title={`Tiempo de retorno: ${tarea.tiempo_retorno}h`}>
              <span className="block text-tierra-oscura/55">Retorno</span>
              <strong>{tarea.tiempo_retorno}h</strong>
            </div>
          </div>
        )}

        {puedeEliminar && tarea.estado === "pendiente" && (
          <div className="mt-2 flex w-full justify-end">
            <button
              onClick={() => setMostrarConfirm(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-200"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        )}
      </div>

      {mostrarConfirm && (
        <ConfirmModal
          titulo="Eliminar Tarea"
          mensaje={`¿Estás seguro de que deseas eliminar "${tarea.nombre}"?`}
          botonConfirmar="Eliminar"
          onConfirmar={handleEliminarClick}
          onCancelar={() => setMostrarConfirm(false)}
          cargando={cargando}
        />
      )}
    </>
  );
}
