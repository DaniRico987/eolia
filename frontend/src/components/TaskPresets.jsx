import { useState, useEffect } from "react";
import { crearTarea, eliminarTarea } from "../api/client";
import { useSnackbar } from "../hooks/useSnackbar";
import { Plus, Download, Edit2, Trash2, FolderOpen } from "lucide-react";

/** @typedef {import("../types").PresetTareas} PresetTareas */
/** @typedef {import("../types").PresetTarea} PresetTarea */
/** @typedef {import("../types").Tarea} Tarea */
/** @typedef {import("../types").Usuario} Usuario */

// Presets predefinidos
/** @type {PresetTareas[]} */
const PRESETS_DEFAULT = [
  {
    id: "preset-1",
    nombre: "Algoritmos Básico",
    tareas: [
      {
        nombre: "Tarea Corta Alta",
        tipo: "riego",
        duracion: 1,
        prioridad: 5,
        llegada: 0,
      },
      {
        nombre: "Tarea Larga Baja",
        tipo: "fumigacion",
        duracion: 8,
        prioridad: 1,
        llegada: 2,
      },
      {
        nombre: "Tarea Media Normal",
        tipo: "cosecha",
        duracion: 4,
        prioridad: 3,
        llegada: 1,
      },
      {
        nombre: "Tarea Corta Normal",
        tipo: "fertilizacion",
        duracion: 2,
        prioridad: 3,
        llegada: 5,
      },
      {
        nombre: "Tarea Larga Alta",
        tipo: "monitoreo",
        duracion: 6,
        prioridad: 4,
        llegada: 3,
      },
      {
        nombre: "Plaga Detectada",
        tipo: "fumigacion",
        duracion: 3,
        prioridad: 5,
        llegada: 4,
      },
    ],
    fechaCreacion: "Sistema",
    esDefault: true,
  },
  {
    id: "preset-2",
    nombre: "Prioridades Extremas",
    tareas: [
      {
        nombre: "Emergencia 1",
        tipo: "cosecha",
        duracion: 2,
        prioridad: 5,
        llegada: 0,
      },
      {
        nombre: "Tarea Baja 1",
        tipo: "monitoreo",
        duracion: 7,
        prioridad: 1,
        llegada: 1,
      },
      {
        nombre: "Emergencia 2",
        tipo: "fumigacion",
        duracion: 3,
        prioridad: 5,
        llegada: 1,
      },
      {
        nombre: "Tarea Baja 2",
        tipo: "riego",
        duracion: 6,
        prioridad: 1,
        llegada: 2,
      },
      {
        nombre: "Prioridad Media",
        tipo: "fertilizacion",
        duracion: 4,
        prioridad: 3,
        llegada: 3,
      },
      {
        nombre: "Emergencia 3",
        tipo: "cosecha",
        duracion: 1,
        prioridad: 5,
        llegada: 5,
      },
    ],
    fechaCreacion: "Sistema",
    esDefault: true,
  },
  {
    id: "preset-3",
    nombre: "Llegadas Escalonadas",
    tareas: [
      {
        nombre: "Lote 1 - Tarea A",
        tipo: "riego",
        duracion: 3,
        prioridad: 2,
        llegada: 6,
      },
      {
        nombre: "Lote 1 - Tarea B",
        tipo: "riego",
        duracion: 3,
        prioridad: 2,
        llegada: 6,
      },
      {
        nombre: "Plaga Lote 2",
        tipo: "fumigacion",
        duracion: 2,
        prioridad: 5,
        llegada: 9,
      },
      {
        nombre: "Lote 2 - Tarea A",
        tipo: "fumigacion",
        duracion: 4,
        prioridad: 3,
        llegada: 10,
      },
      {
        nombre: "Lote 2 - Tarea B",
        tipo: "fumigacion",
        duracion: 4,
        prioridad: 3,
        llegada: 10,
      },
      {
        nombre: "Lote 3 - Tarea A",
        tipo: "cosecha",
        duracion: 5,
        prioridad: 4,
        llegada: 14,
      },
      {
        nombre: "Lote 3 - Tarea B",
        tipo: "cosecha",
        duracion: 5,
        prioridad: 4,
        llegada: 14,
      },
    ],
    fechaCreacion: "Sistema",
    esDefault: true,
  },
  {
    id: "preset-4",
    nombre: "Duración Variada",
    tareas: [
      {
        nombre: "MiniTarea 1",
        tipo: "monitoreo",
        duracion: 1,
        prioridad: 2,
        llegada: 0,
      },
      {
        nombre: "MiniTarea 2",
        tipo: "monitoreo",
        duracion: 1,
        prioridad: 2,
        llegada: 1,
      },
      {
        nombre: "Corta 1",
        tipo: "riego",
        duracion: 2,
        prioridad: 3,
        llegada: 0,
      },
      {
        nombre: "Corta 2",
        tipo: "riego",
        duracion: 2,
        prioridad: 3,
        llegada: 2,
      },
      {
        nombre: "Media 1",
        tipo: "fertilizacion",
        duracion: 5,
        prioridad: 3,
        llegada: 1,
      },
      {
        nombre: "Media 2",
        tipo: "fumigacion",
        duracion: 5,
        prioridad: 3,
        llegada: 3,
      },
      {
        nombre: "Larga 1",
        tipo: "cosecha",
        duracion: 10,
        prioridad: 2,
        llegada: 2,
      },
    ],
    fechaCreacion: "Sistema",
    esDefault: true,
  },
  {
    id: "preset-5",
    nombre: "Caso Complejo",
    tareas: [
      {
        nombre: "Preparación",
        tipo: "monitoreo",
        duracion: 1,
        prioridad: 3,
        llegada: 0,
      },
      {
        nombre: "Riego Urgente",
        tipo: "riego",
        duracion: 2,
        prioridad: 5,
        llegada: 0,
      },
      {
        nombre: "Fumigación A",
        tipo: "fumigacion",
        duracion: 4,
        prioridad: 4,
        llegada: 1,
      },
      {
        nombre: "Monitoreo Sectores",
        tipo: "monitoreo",
        duracion: 3,
        prioridad: 2,
        llegada: 2,
      },
      {
        nombre: "Fertilización",
        tipo: "fertilizacion",
        duracion: 6,
        prioridad: 3,
        llegada: 2,
      },
      {
        nombre: "Plaga Crítica",
        tipo: "fumigacion",
        duracion: 2,
        prioridad: 5,
        llegada: 4,
      },
      {
        nombre: "Cosecha Urgente",
        tipo: "cosecha",
        duracion: 7,
        prioridad: 5,
        llegada: 3,
      },
      {
        nombre: "Limpieza",
        tipo: "monitoreo",
        duracion: 2,
        prioridad: 1,
        llegada: 10,
      },
    ],
    fechaCreacion: "Sistema",
    esDefault: true,
  },
  {
    id: "preset-6",
    nombre: "Plagas Múltiples",
    tareas: [
      {
        nombre: "Monitoreo Inicial",
        tipo: "monitoreo",
        duracion: 1,
        prioridad: 2,
        llegada: 0,
      },
      {
        nombre: "Riego Preventivo",
        tipo: "riego",
        duracion: 2,
        prioridad: 3,
        llegada: 1,
      },
      {
        nombre: "Plaga Sector A",
        tipo: "fumigacion",
        duracion: 3,
        prioridad: 5,
        llegada: 2,
      },
      {
        nombre: "Plaga Sector B",
        tipo: "fumigacion",
        duracion: 2,
        prioridad: 5,
        llegada: 5,
      },
      {
        nombre: "Plaga Sector C",
        tipo: "fumigacion",
        duracion: 4,
        prioridad: 5,
        llegada: 8,
      },
      {
        nombre: "Limpieza y Desinfección",
        tipo: "fumigacion",
        duracion: 3,
        prioridad: 4,
        llegada: 10,
      },
    ],
    fechaCreacion: "Sistema",
    esDefault: true,
  },
];

/** @param {{ usuario: Usuario; tareas: Tarea[]; onCargarPreset: () => void }} props */
export default function TaskPresets({ usuario, tareas, onCargarPreset }) {
  const { showSnackbar } = useSnackbar();
  const [presets, setPresets] = useState(/** @type {PresetTareas[]} */ ([]));
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombrePreset, setNombrePreset] = useState("");
  const [editando, setEditando] = useState(/** @type {number | null} */ (null));
  const [cargando, setCargando] = useState(false);
  const [modalAccion, setModalAccion] = useState(/** @type {"opciones" | null} */ (null));
  const [presetACargar, setPresetACargar] = useState(/** @type {PresetTareas | null} */ (null));

  useEffect(() => {
    /** @type {PresetTareas[]} */
    const guardados = JSON.parse(localStorage.getItem("taskPresets") || "[]");
    const presetsCombinados = [...PRESETS_DEFAULT, ...guardados];
    setPresets(presetsCombinados);
  }, []);

  /** @param {PresetTareas[]} nuevosPresets */
  const guardarPresets = (nuevosPresets) => {
    const personalizados = nuevosPresets.filter((p) => !p.esDefault);
    setPresets(nuevosPresets);
    localStorage.setItem("taskPresets", JSON.stringify(personalizados));
  };

  const handleGuardarPreset = () => {
    if (!nombrePreset.trim()) {
      showSnackbar("Ingresa un nombre para el conjunto", "warning");
      return;
    }

    const tareasActuales = tareas.filter((t) => t.estado === "pendiente");
    if (tareasActuales.length === 0) {
      showSnackbar("No hay tareas pendientes para guardar", "warning");
      return;
    }

    if (editando !== null) {
      const preset = presets[editando];
      if (preset.esDefault) {
        showSnackbar("No puedes editar presets del sistema", "error");
        return;
      }

      const actualizados = presets.map((p, i) =>
        i === editando
          ? {
              ...p,
              nombre: nombrePreset,
              tareas: tareasActuales.map((t) => ({
                nombre: t.nombre,
                tipo: t.tipo,
                duracion: t.duracion,
                prioridad: t.prioridad,
                llegada: t.llegada,
              })),
            }
          : p,
      );
      guardarPresets(actualizados);
      setEditando(null);
      showSnackbar(`Conjunto "${nombrePreset}" actualizado`, "success");
    } else {
      const nuevoPreset = {
        id: Date.now(),
        nombre: nombrePreset,
        tareas: tareasActuales.map((t) => ({
          nombre: t.nombre,
          tipo: t.tipo,
          duracion: t.duracion,
          prioridad: t.prioridad,
          llegada: t.llegada,
        })),
        fechaCreacion: new Date().toLocaleString(),
        esDefault: false,
      };
      guardarPresets([...presets, nuevoPreset]);
      showSnackbar(`Nuevo conjunto "${nombrePreset}" guardado`, "success");
    }

    setNombrePreset("");
    setMostrarModal(false);
  };

  /** @param {PresetTareas} preset */
  const handleCargarPresetClick = (preset) => {
    const tareasExistentes = tareas.filter((t) => t.estado === "pendiente");

    if (tareasExistentes.length > 0) {
      setPresetACargar(preset);
      setModalAccion("opciones");
    } else {
      handleCargarPreset(preset, "reemplazar");
    }
  };

  /** @param {PresetTareas} preset @param {"reemplazar" | "merge"} accion */
  const handleCargarPreset = async (preset, accion) => {
    setCargando(true);
    try {
      if (accion === "reemplazar") {
        const tareasPendientes = tareas.filter((t) => t.estado === "pendiente");
        await Promise.all(
          tareasPendientes.map((tarea) => eliminarTarea(tarea.id)),
        );
      }

      for (const tarea of preset.tareas) {
        await crearTarea(tarea);
      }

      const mensaje =
        accion === "reemplazar"
          ? `Conjunto "${preset.nombre}" cargado (reemplazadas tareas anteriores)`
          : `Conjunto "${preset.nombre}" añadido a tareas existentes`;

      showSnackbar(mensaje, "success", 4000);
      onCargarPreset();
      setModalAccion(null);
      setPresetACargar(null);
    } catch (e) {
      const error = /** @type {{ message?: string }} */ (e);
      showSnackbar("Error al cargar el preset: " + (error.message || "desconocido"), "error");
    } finally {
      setCargando(false);
    }
  };

  /** @param {PresetTareas} preset @param {number} index */
  const handleEditarPreset = (preset, index) => {
    if (preset.esDefault) {
      showSnackbar("No puedes editar presets del sistema", "error");
      return;
    }
    setEditando(index);
    setNombrePreset(preset.nombre);
    setMostrarModal(true);
  };

  /** @param {number} index */
  const handleEliminarPreset = (index) => {
    const preset = presets[index];
    if (preset.esDefault) {
      showSnackbar("No puedes eliminar presets del sistema", "error");
      return;
    }
    if (confirm("¿Está seguro de que desea eliminar este preset?")) {
      guardarPresets(presets.filter((_, i) => i !== index));
      showSnackbar(`Conjunto "${preset.nombre}" eliminado`, "info");
    }
  };

  if (usuario.rol !== "ingeniero") {
    return null;
  }

  const presetsPersonalizados = presets.filter((p) => !p.esDefault);
  const tareasExistentes = tareas.filter(
    (t) => t.estado === "pendiente",
  ).length;

  return (
    <>
      <section className="card">
        <div className="flex flex-col gap-3 px-4 py-4 mb-4 sm:items-center sm:justify-between">
          <h3 className="flex min-w-0 items-center gap-2 font-fraunces font-bold text-tierra-oscura text-lg leading-tight">
            <Download size={18} /> Conjuntos
          </h3>
          <button
            onClick={() => {
              setEditando(null);
              setNombrePreset("");
              setMostrarModal(true);
            }}
            className="btn-cta self-start shrink-0 text-xs px-3 py-2 flex items-center gap-1 sm:self-auto "
          >
            <Plus size={14} /> Nuevo
          </button>
        </div>

        <div className="space-y-2">
          {presets.length === 0 ? (
            <p className="text-sm text-tierra-oscura opacity-60 text-center py-4">
              No hay conjuntos disponibles.
            </p>
          ) : (
            presets.map((preset, idx) => (
              <div
                key={preset.id}
                className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg p-3 transition min-h-[70px] ${
                  preset.esDefault
                    ? "bg-verde-musgo/5 border border-verde-musgo/20"
                    : "bg-arena hover:bg-arena/80 border border-arena"
                }`}
              >
                <div className="min-w-0">
                  <p
                    className="font-medium text-sm text-tierra-oscura truncate leading-tight"
                    title={preset.nombre}
                  >
                    {preset.nombre}
                  </p>
                  <p
                    className="text-xs text-tierra-oscura opacity-60 truncate leading-tight mt-1"
                    title={`$${preset.tareas.length} tareas $${preset.esDefault ? "• Sistema" : `• $${preset.fechaCreacion}`}`}
                  >
                    {preset.tareas.length} tareas{" "}
                    {preset.esDefault
                      ? "• Sistema"
                      : `• ${preset.fechaCreacion}`}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0 self-center">
                  <button
                    onClick={() => handleCargarPresetClick(preset)}
                    disabled={cargando}
                    className="p-2 bg-verde-musgo text-crema hover:bg-verde-oliva transition rounded-lg disabled:opacity-50"
                    title="Cargar este conjunto"
                  >
                    <FolderOpen size={16} />
                  </button>
                  {!preset.esDefault && (
                    <>
                      <button
                        onClick={() => handleEditarPreset(preset, idx)}
                        className="p-2 bg-dorado-trigo text-tierra-oscura hover:bg-dorado-trigo/80 transition rounded-lg"
                        title="Editar nombre"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminarPreset(idx)}
                        className="p-2 bg-red-600 text-white hover:bg-red-700 transition rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {presetsPersonalizados.length > 0 && (
          <p className="text-xs text-tierra-oscura opacity-50 mt-3 text-center">
            {presetsPersonalizados.length} personalizado(s) •{" "}
            {PRESETS_DEFAULT.length} del sistema
          </p>
        )}
      </section>

      {modalAccion === "opciones" && presetACargar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card bg-blanco-hueso max-w-sm w-full">
            <h3 className="font-fraunces font-bold text-lg text-tierra-oscura mb-2">
              Ya existen tareas pendientes
            </h3>
            <p className="text-sm text-tierra-oscura opacity-70 mb-4">
              Tienes <strong>{tareasExistentes} tarea(s) pendiente(s)</strong>.
              ¿Qué deseas hacer?
            </p>
            <div className="space-y-2 flex flex-col">
              <button
                onClick={() => handleCargarPreset(presetACargar, "reemplazar")}
                className="btn-destructive"
              >
                Borrar y Cargar Nuevo
              </button>
              <button
                onClick={() => handleCargarPreset(presetACargar, "merge")}
                className="btn-primary"
              >
                Añadir al Existente
              </button>
              <button
                onClick={() => {
                  setModalAccion(null);
                  setPresetACargar(null);
                }}
                className="btn-primary bg-arena text-tierra-oscura hover:bg-verde-musgo/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card bg-blanco-hueso max-w-sm w-full">
            <h3 className="font-fraunces font-bold text-lg text-tierra-oscura mb-4">
              {editando !== null ? "Editar Conjunto" : "Nuevo Conjunto"}
            </h3>
            <div className="mb-4">
              <label className="block text-xs font-medium text-tierra-oscura mb-2">
                Nombre del Conjunto
              </label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="Ej: Riego Matutino"
                value={nombrePreset}
                onChange={(e) => setNombrePreset(e.target.value)}
                autoFocus
              />
            </div>
            <p className="text-xs text-tierra-oscura opacity-60 mb-4">
              Se guardará con{" "}
              {tareas.filter((t) => t.estado === "pendiente").length} tarea(s)
              pendiente(s)
            </p>
            <div className="flex gap-2">
              <button onClick={handleGuardarPreset} className="btn-cta flex-1">
                {editando !== null ? "Actualizar" : "Guardar"}
              </button>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setEditando(null);
                  setNombrePreset("");
                }}
                className="btn-primary flex-1 bg-arena text-tierra-oscura hover:bg-verde-musgo/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
