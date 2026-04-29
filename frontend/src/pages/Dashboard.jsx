import { useEffect, useState } from "react";
import {
  getTareas,
  crearTarea,
  eliminarTarea,
  simular,
  getRecursos,
} from "../api/client";
import { useSnackbar } from "../hooks/useSnackbar";
import TareaCard from "../components/TareaCard";
import GanttChart from "../components/GanttChart";
import RecursoStatus from "../components/RecursoStatus";
import TaskPresets from "../components/TaskPresets";
import ConfirmModal from "../components/ConfirmModal";
import NuevaTareaModal from "../components/NuevaTareaModal";
import {
  Plus,
  Trash2,
  Play,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";

/** @typedef {import("../types").Algoritmo} Algoritmo */
/** @typedef {import("../types").RecursoMapa} RecursoMapa */
/** @typedef {import("../types").ResultadoSimulacion} ResultadoSimulacion */
/** @typedef {import("../types").Tarea} Tarea */
/** @typedef {import("../types").TareaInput} TareaInput */
/** @typedef {import("../types").Usuario} Usuario */

/** @type {Algoritmo[]} */
const ALGORITMOS = ["fcfs", "sjf", "priority", "round_robin"];
/** @type {Record<Algoritmo, string>} */
const ALGORITMO_LABELS = {
  fcfs: "FCFS (First-Come First-Served)",
  sjf: "SJF (Shortest Job First)",
  priority: "Priority (Por Prioridad)",
  round_robin: "Round Robin (Quantum)",
};

/** @param {{ usuario: Usuario }} props */
export default function Dashboard({ usuario }) {
  const { showSnackbar } = useSnackbar();
  const [tareas, setTareas] = useState(/** @type {Tarea[]} */ ([]));
  const [recursos, setRecursos] = useState(/** @type {RecursoMapa} */ ({}));
  const [resultado, setResultado] = useState(/** @type {ResultadoSimulacion | null} */ (null));
  const [algoritmo, setAlgoritmo] = useState(/** @type {Algoritmo} */ ("fcfs"));
  const [quantum, setQuantum] = useState(2);
  const [cargando, setCargando] = useState(false);
  const [mostrarConfirmLimpiar, setMostrarConfirmLimpiar] = useState(false);
  const [cargandoLimpiar, setCargandoLimpiar] = useState(false);
  const [mostrarModalNueva, setMostrarModalNueva] = useState(false);
  const [cargandoCrear, setCargandoCrear] = useState(false);
  const [paginaTareas, setPaginaTareas] = useState(1);
  const [nueva, setNueva] = useState(/** @type {TareaInput} */ ({
    nombre: "",
    tipo: "riego",
    duracion: 2,
    prioridad: 2,
    llegada: 6,
  }));

  const tareasPendientes = tareas.filter((t) => t.estado === "pendiente");
  const tareasPorPagina = 6;
  const totalPaginas = Math.max(
    1,
    Math.ceil(tareasPendientes.length / tareasPorPagina),
  );
  const indiceInicio = (paginaTareas - 1) * tareasPorPagina;
  const tareasVisibles = tareasPendientes.slice(
    indiceInicio,
    indiceInicio + tareasPorPagina,
  );

  const cargar = async () => {
    const [t, r] = await Promise.all([getTareas(), getRecursos()]);
    setTareas(t.data);
    setRecursos(r.data);
  };

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    setPaginaTareas((paginaActual) => Math.min(paginaActual, totalPaginas));
  }, [totalPaginas]);

  const handleCrear = async () => {
    if (!nueva.nombre.trim()) return;
    setCargandoCrear(true);
    try {
      await crearTarea(nueva);
      setNueva({
        nombre: "",
        tipo: "riego",
        duracion: 2,
        prioridad: 2,
        llegada: 6,
      });
      setPaginaTareas(1);
      await cargar();
      showSnackbar(`Tarea "${nueva.nombre}" creada`, "success");
      setMostrarModalNueva(false);
    } catch (e) {
      const error = /** @type {{ message?: string }} */ (e);
      showSnackbar("Error al crear tarea: " + (error.message || "desconocido"), "error");
    } finally {
      setCargandoCrear(false);
    }
  };

  /** @param {number} id */
  const handleEliminar = async (id) => {
    try {
      await eliminarTarea(id);
      setPaginaTareas(1);
      await cargar();
      showSnackbar("Tarea eliminada", "info");
    } catch {
      showSnackbar("Error al eliminar tarea", "error");
    }
  };

  const handleSimular = async () => {
    setCargando(true);
    try {
      const res = await simular(algoritmo, quantum);
      setResultado(res.data);
      await cargar();
      showSnackbar(
        `Simulación completada con ${ALGORITMO_LABELS[algoritmo]}`,
        "success",
        4000,
      );
    } catch (e) {
      const error = /** @type {{ response?: { data?: { detail?: string } } }} */ (e);
      showSnackbar(error.response?.data?.detail || "Error en simulación", "error");
    } finally {
      setCargando(false);
    }
  };

  const handleLimpiarTodas = async () => {
    if (tareasPendientes.length === 0) {
      showSnackbar("No hay tareas pendientes para limpiar", "info");
      return;
    }
    setCargandoLimpiar(true);
    try {
      for (const tarea of tareasPendientes) {
        await eliminarTarea(tarea.id);
      }
      setPaginaTareas(1);
      await cargar();
      showSnackbar(
        `${tareasPendientes.length} tarea${tareasPendientes.length !== 1 ? "s" : ""} eliminada${tareasPendientes.length !== 1 ? "s" : ""}`,
        "success",
      );
    } catch {
      showSnackbar("Error al limpiar tareas", "error");
    } finally {
      setCargandoLimpiar(false);
      setMostrarConfirmLimpiar(false);
    }
  };

  return (
    <div className="min-h-screen bg-crema">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <h2 className="font-fraunces text-3xl sm:text-4xl font-bold text-verde-musgo mb-8">
          Dashboard — Ingeniero
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_0.8fr_2.45fr] gap-4 sm:gap-6 items-stretch">
          {/* Columna 1: Presets */}
          <div className="min-w-0 h-full">
            <div className="h-full space-y-4">
              {usuario.rol === "ingeniero" && (
                <TaskPresets
                  usuario={usuario}
                  tareas={tareas}
                  onCargarPreset={() => {
                    setPaginaTareas(1);
                    cargar();
                  }}
                />
              )}
            </div>
          </div>

          {/* Columna 2: Recursos y Simulación */}
          <div className="min-w-0 h-full">
            <div className="h-full space-y-4">
              <section className="card">
                <h3 className="font-fraunces font-bold text-tierra-oscura mb-4 flex items-center gap-2">
                  🔧 Recursos
                </h3>
                <RecursoStatus recursos={recursos} />
              </section>

              <section className="card">
                <h3 className="font-fraunces font-bold text-tierra-oscura mb-4 flex items-center gap-2">
                  <Settings size={18} className="text-verde-oliva" /> Simulación
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-tierra-oscura mb-2">
                      Algoritmo de Scheduling
                    </label>
                    <select
                      className="input-field w-full border border-verde-oliva/30 font-medium text-tierra-oscura"
                      value={algoritmo}
                      onChange={(e) => setAlgoritmo(/** @type {Algoritmo} */ (e.target.value))}
                    >
                      {ALGORITMOS.map((a) => (
                        <option key={a} value={a}>
                          {ALGORITMO_LABELS[a]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {algoritmo === "round_robin" && (
                    <div>
                      <label className="block text-xs font-medium text-tierra-oscura mb-2">
                        Quantum (unidades de tiempo)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          className="flex-1 cursor-pointer accent-dorado-trigo"
                          value={quantum}
                          onChange={(e) => setQuantum(Number(e.target.value))}
                        />
                        <span className="text-sm font-semibold text-dorado-trigo w-10 text-center">
                          {quantum}h
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSimular}
                    disabled={cargando || tareasPendientes.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-dorado-trigo text-blanco-hueso font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play size={16} /> {cargando ? "Simulando..." : "Simular"}
                  </button>
                </div>
              </section>
            </div>
          </div>

          {/* Columna 3: Tareas */}
          <div className="min-w-0 h-full">
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="font-fraunces font-bold text-tierra-oscura text-lg">
                  Tareas Pendientes ({tareasPendientes.length})
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setMostrarModalNueva(true)}
                    className="btn-cta text-xs px-3 py-2 flex items-center gap-1.5"
                  >
                    <Plus size={16} /> Nueva
                  </button>
                  {tareasPendientes.length > 0 && (
                    <button
                      onClick={() => setMostrarConfirmLimpiar(true)}
                      className="btn-destructive text-xs px-3 py-2 flex items-center gap-1.5"
                    >
                      <Trash2 size={16} /> Limpiar todas
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tareasVisibles.map((t) => (
                  <TareaCard
                    key={t.id}
                    tarea={t}
                    onEliminar={handleEliminar}
                    puedeEliminar={true}
                  />
                ))}
                {tareasPendientes.length === 0 && (
                  <div className="col-span-1 sm:col-span-2 card text-center py-8">
                    <p className="text-tierra-oscura font-medium">
                      No hay tareas pendientes
                    </p>
                    <p className="text-xs text-tierra-oscura opacity-60 mt-1">
                      Crea una nueva o carga un preset
                    </p>
                  </div>
                )}
              </div>

              {tareasPendientes.length > tareasPorPagina && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setPaginaTareas((p) => Math.max(1, p - 1))}
                    disabled={paginaTareas === 1}
                    className="p-2 rounded-lg border border-arena bg-blanco-hueso text-tierra-oscura hover:bg-arena transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <span className="text-xs text-tierra-oscura opacity-70 font-medium">
                    Página {paginaTareas} de {totalPaginas}
                  </span>
                  <button
                    onClick={() =>
                      setPaginaTareas((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={paginaTareas === totalPaginas}
                    className="p-2 rounded-lg border border-arena bg-blanco-hueso text-tierra-oscura hover:bg-arena transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Siguiente <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>

        {resultado && (
          <section className="mt-8">
            <div>
              <h3 className="font-fraunces font-bold text-tierra-oscura text-xl mb-4">
                Resultados — {resultado.algoritmo.toUpperCase()}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(resultado.metricas).map(([k, v]) => (
                  <div
                    key={k}
                    className="card text-center hover:shadow-md transition"
                  >
                    <p className="text-xs text-tierra-oscura opacity-60 capitalize font-medium">
                      {k.replace("_", " ")}
                    </p>
                    <p className="text-2xl font-bold text-dorado-trigo mt-2">
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <GanttChart tareas={resultado.tareas} />
          </section>
        )}
      </div>

      <NuevaTareaModal
        isOpen={mostrarModalNueva}
        onClose={() => setMostrarModalNueva(false)}
        onCrear={handleCrear}
        cargando={cargandoCrear}
        nuevaTarea={nueva}
        setNuevaTarea={setNueva}
      />

      {mostrarConfirmLimpiar && (
        <ConfirmModal
          titulo="Limpiar todas las tareas"
          mensaje={`¿Eliminar ${tareasPendientes.length} tarea${tareasPendientes.length !== 1 ? "s" : ""}?`}
          botonConfirmar="Limpiar"
          onConfirmar={handleLimpiarTodas}
          onCancelar={() => setMostrarConfirmLimpiar(false)}
          cargando={cargandoLimpiar}
        />
      )}
    </div>
  );
}
