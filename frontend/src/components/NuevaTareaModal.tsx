import React from "react";
import { X, Plus } from "lucide-react";
import type { TipoTarea, TareaInput } from "../types";

const TIPOS: TipoTarea[] = [
  "riego",
  "fumigacion",
  "cosecha",
  "fertilizacion",
  "monitoreo",
];
const TIPOS_LABELS: Record<TipoTarea, string> = {
  riego: "Riego",
  fumigacion: "Fumigación",
  cosecha: "Cosecha",
  fertilizacion: "Fertilización",
  monitoreo: "Monitoreo",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCrear: () => void | Promise<void>;
  cargando: boolean;
  nuevaTarea: TareaInput;
  setNuevaTarea: (value: TareaInput) => void;
}

export default function NuevaTareaModal({
  isOpen,
  onClose,
  onCrear,
  cargando,
  nuevaTarea,
  setNuevaTarea,
}: Props) {
  if (!isOpen) return null;

  const handleCrear = () => {
    if (!nuevaTarea.nombre.trim()) return;
    onCrear();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-blanco-hueso rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-right border border-arena">
        <div className="sticky top-0 bg-blanco-hueso border-b border-arena p-4 sm:p-6 flex items-center justify-between">
          <h2 className="font-fraunces text-lg sm:text-xl font-bold text-tierra-oscura flex items-center gap-2">
            <Plus size={20} /> Nueva Tarea
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-arena transition-colors rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-tierra-oscura mb-2">
              Nombre de la Tarea *
            </label>
            <input
              className="input-field w-full"
              placeholder="Ej: Riego de cultivo A"
              value={nuevaTarea.nombre}
              onChange={(e) =>
                setNuevaTarea({ ...nuevaTarea, nombre: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-tierra-oscura mb-2">
                Tipo de Tarea
              </label>
              <select
                className="input-field w-full"
                value={nuevaTarea.tipo}
                onChange={(e) =>
                  setNuevaTarea({
                    ...nuevaTarea,
                    tipo: e.target.value as TipoTarea,
                  })
                }
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {TIPOS_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-tierra-oscura mb-2">
                Duración (horas) *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={24}
                  className="flex-1 cursor-pointer accent-dorado-trigo"
                  value={nuevaTarea.duracion}
                  onChange={(e) =>
                    setNuevaTarea({
                      ...nuevaTarea,
                      duracion: Number(e.target.value),
                    })
                  }
                />
                <span className="text-sm font-semibold text-dorado-trigo w-12 text-right">
                  {nuevaTarea.duracion}h
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-tierra-oscura mb-2">
                Prioridad (1-5)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={5}
                  className="flex-1 cursor-pointer accent-verde-musgo"
                  value={nuevaTarea.prioridad}
                  onChange={(e) =>
                    setNuevaTarea({
                      ...nuevaTarea,
                      prioridad: Number(e.target.value),
                    })
                  }
                />
                <span className="text-sm font-semibold text-verde-musgo w-8 text-right">
                  {nuevaTarea.prioridad}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-tierra-oscura mb-2">
                Hora de Llegada (0-23h)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={23}
                  className="flex-1 cursor-pointer accent-dorado-trigo"
                  value={nuevaTarea.llegada}
                  onChange={(e) =>
                    setNuevaTarea({
                      ...nuevaTarea,
                      llegada: Number(e.target.value),
                    })
                  }
                />
                <span className="text-sm font-semibold text-dorado-trigo w-12 text-right">
                  {nuevaTarea.llegada}h
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-arena border-t border-arena/50 p-4 sm:p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={cargando}
            className="btn-primary bg-arena text-tierra-oscura hover:bg-verde-musgo/10"
          >
            Cancelar
          </button>
          <button
            onClick={handleCrear}
            disabled={!nuevaTarea.nombre || cargando}
            className="btn-cta flex items-center gap-2"
          >
            {cargando ? (
              "Creando..."
            ) : (
              <>
                <Plus size={16} /> Agregar Tarea
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
