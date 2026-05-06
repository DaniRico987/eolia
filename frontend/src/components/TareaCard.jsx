import { useState } from "react";
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

/** @typedef {import("../types").EstadoTarea} EstadoTarea */
/** @typedef {import("../types").Tarea} Tarea */
/** @typedef {import("lucide-react").LucideIcon} LucideIcon */

/** @type {Record<Tarea["tipo"], LucideIcon>} */
const ICONOS_TIPO = {
  riego: Droplets,
  fumigacion: Sprout,
  cosecha: Wheat,
  fertilizacion: Leaf,
  monitoreo: Eye,
};

/** @param {{ tarea: Tarea; onEliminar?: (id: number) => void | Promise<void>; puedeEliminar: boolean }} props */
export default function TareaCard({ tarea, onEliminar, puedeEliminar }) {
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

  return (
    <>
      <div className="card hover:shadow-md transition">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <IconComponent
              size={20}
              className="text-dorado-trigo flex-shrink-0"
            />
            <span
              className="font-medium text-sm sm:text-base truncate text-tierra-oscura"
              title={tarea.nombre}
            >
              {tarea.nombre}
            </span>
          </div>
        </div>

        <div className="flex gap-3 text-xs text-tierra-oscura mt-3">
          <div
            className="truncate flex w-fit"
            title={`${tarea.duracion} horas`}
          >
            <span className="font-medium block text-tierra-oscura/70">⏱️</span>
            {tarea.duracion}h
          </div>
          <div className="truncate flex" title={`Prioridad ${tarea.prioridad}`}>
            <span className="font-medium block text-tierra-oscura/70">⭐</span>
            {tarea.prioridad}
          </div>
          <div
            className="truncate flex"
            title={`Llegada ${tarea.llegada} horas`}
          >
            <span className="font-medium block text-tierra-oscura/70">🕐</span>
            {tarea.llegada}h
          </div>
        </div>

        {tarea.inicio !== null && (
          <div className="grid grid-cols-2 gap-2 text-xs text-tierra-oscura mt-2">
            <div title={`Tiempo de espera: ${tarea.tiempo_espera}h`}>
              ⏳ Espera: {tarea.tiempo_espera}h
            </div>
            <div title={`Tiempo de retorno: ${tarea.tiempo_retorno}h`}>
              🔄 Retorno: {tarea.tiempo_retorno}h
            </div>
          </div>
        )}

        {puedeEliminar && tarea.estado === "pendiente" && (
          <div className="w-full flex justify-end">
            <button
              onClick={() => setMostrarConfirm(true)}
              className="text-xs text-red-600 hover:text-red-700 bg-red-100 p-1.5 rounded font-medium mt-2 flex items-center gap-1 transition"
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
