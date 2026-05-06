import { useEffect, useRef, useState } from "react";
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
  Pause,
  RotateCcw,
  Clock3,
  Activity,
  ListChecks,
} from "lucide-react";

/** @typedef {import("../types").Algoritmo} Algoritmo */
/** @typedef {import("../types").RecursoMapa} RecursoMapa */
/** @typedef {import("../types").ResultadoSimulacion} ResultadoSimulacion */
/** @typedef {import("../types").Tarea} Tarea */
/** @typedef {import("../types").TareaInput} TareaInput */
/** @typedef {import("../types").Usuario} Usuario */
/** @typedef {Tarea & { recurso?: string }} TareaSimulada */
/** @typedef {"slow" | "normal" | "fast"} SimulationSpeed */
/** @typedef {"idle" | "running" | "paused" | "finished"} SimulationStatus */
/** @typedef {{ id: string; nombre: string; estado: string; detalle: string; tareaActual: TareaSimulada | null; cola: TareaSimulada[] }} SimulationResourceState */
/** @typedef {{ id: number; tarea: TareaSimulada; nombre: string; startTime: number; endTime: number; leftPct: number; widthPct: number; progressLabel: string; color: string }} GanttBar */
/** @typedef {{ id: string; nombre: string; bars: GanttBar[] }} GanttRow */
/** @typedef {{ status: SimulationStatus; currentTime: number; speed: SimulationSpeed; finalTime: number; tasks: TareaSimulada[]; resourceStates: SimulationResourceState[]; pendingQueue: TareaSimulada[]; runningTasks: TareaSimulada[]; completedTasks: TareaSimulada[]; ganttRows: GanttRow[]; currentTask: TareaSimulada | null; nextTask: TareaSimulada | null; }} SimulationState */

/** @type {Algoritmo[]} */
const ALGORITMOS = ["fcfs", "sjf", "priority", "round_robin"];
/** @type {Record<Algoritmo, string>} */
const ALGORITMO_LABELS = {
  fcfs: "FCFS (First-Come First-Served)",
  sjf: "SJF (Shortest Job First)",
  priority: "Priority (Por Prioridad)",
  round_robin: "Round Robin (Quantum)",
};

/** @type {Record<SimulationSpeed, { label: string; delay: number }>} */
const SPEEDS = {
  slow: { label: "Lento", delay: 1200 },
  normal: { label: "Normal", delay: 600 },
  fast: { label: "Rápido", delay: 200 },
};

const RECURSOS_BASE = [
  { id: "bomba_agua", label: "Bomba Agua" },
  { id: "tractor", label: "Tractor" },
  { id: "equipo_fumigador", label: "Equipo Fumigador" },
  { id: "ninguno", label: "Ninguno" },
];

const TASK_COLORS = [
  "#3B5233",
  "#C4922A",
  "#6B7C45",
  "#8B5E3C",
  "#4A6741",
  "#D4A843",
  "#5C7A52",
  "#A0522D",
];

/** @type {SimulationState} */
const SIMULATION_EMPTY = {
  status: "idle",
  currentTime: 0,
  speed: "normal",
  finalTime: 0,
  tasks: /** @type {TareaSimulada[]} */ ([]),
  resourceStates: /** @type {SimulationResourceState[]} */ ([]),
  pendingQueue: /** @type {TareaSimulada[]} */ ([]),
  runningTasks: /** @type {TareaSimulada[]} */ ([]),
  completedTasks: /** @type {TareaSimulada[]} */ ([]),
  ganttRows: /** @type {GanttRow[]} */ ([]),
  currentTask: null,
  nextTask: null,
};

/** @param {TareaSimulada[]} tareas */
const obtenerTiempoFinal = (tareas) =>
  tareas.reduce((maximo, tarea) => Math.max(maximo, tarea.fin ?? 0), 0);

/** @param {number} value */
const formatearDuracion = (value) =>
  Number.isInteger(value) ? `${value}` : value.toFixed(1);

/** @param {TareaSimulada} tarea @param {number} indice */
const obtenerColorTarea = (tarea, indice) =>
  TASK_COLORS[(tarea.id + indice) % TASK_COLORS.length];

/** @param {TareaSimulada[]} tareasSimuladas @param {number} currentTime */
const crearSnapshotSimulacion = (tareasSimuladas, currentTime) => {
  const tareasOrdenadas = [...tareasSimuladas].sort((a, b) => {
    const inicioA = a.inicio ?? a.llegada;
    const inicioB = b.inicio ?? b.llegada;
    return inicioA - inicioB || a.llegada - b.llegada || a.id - b.id;
  });

  const runningTasks = tareasOrdenadas.filter(
    (tarea) =>
      tarea.inicio !== null &&
      tarea.fin !== null &&
      tarea.inicio <= currentTime &&
      currentTime < tarea.fin,
  );
  const completedTasks = tareasOrdenadas.filter(
    (tarea) => tarea.fin !== null && tarea.fin <= currentTime,
  );
  const pendingQueue = tareasOrdenadas.filter(
    (tarea) =>
      tarea.llegada <= currentTime &&
      (tarea.inicio === null || tarea.inicio > currentTime),
  );
  const upcomingTasks = tareasOrdenadas.filter(
    (tarea) => tarea.llegada > currentTime,
  );

  const resourceStates = RECURSOS_BASE.map((recurso) => {
    const runningForResource = runningTasks.filter(
      (tarea) => (tarea.recurso || "ninguno") === recurso.id,
    );
    const queuedForResource = pendingQueue.filter(
      (tarea) => (tarea.recurso || "ninguno") === recurso.id,
    );

    let estado = "Libre";
    let detalle = "Disponible";

    if (runningForResource.length > 0) {
      estado = "Ocupado";
      detalle =
        runningForResource.length === 1
          ? `Ejecutando ${runningForResource[0].nombre}`
          : `${runningForResource[0].nombre} +${runningForResource.length - 1}`;
    } else if (queuedForResource.length > 0) {
      estado = "En cola";
      detalle = `${queuedForResource.length} tarea${queuedForResource.length !== 1 ? "s" : ""} esperando`;
    }

    return {
      id: recurso.id,
      nombre: recurso.label,
      estado,
      detalle,
      tareaActual: runningForResource[0] ?? null,
      cola: queuedForResource,
    };
  });

  const ganttRows = RECURSOS_BASE.map((recurso, rowIndex) => {
    const bars = tareasOrdenadas
      .filter((tarea) => (tarea.recurso || "ninguno") === recurso.id)
      .filter(
        (tarea) =>
          tarea.inicio !== null &&
          tarea.fin !== null &&
          currentTime >= tarea.inicio,
      )
      .map((tarea, index) => {
        const inicio = tarea.inicio ?? tarea.llegada;
        const fin = tarea.fin ?? inicio + tarea.duracion;
        const duracion = Math.max(1, fin - inicio);
        const progreso =
          currentTime >= fin ? duracion : Math.max(0, currentTime - inicio);
        const widthPct =
          (progreso / Math.max(1, obtenerTiempoFinal(tareasSimuladas))) * 100;
        const leftPct =
          (inicio / Math.max(1, obtenerTiempoFinal(tareasSimuladas))) * 100;

        return {
          id: tarea.id,
          tarea,
          nombre: tarea.nombre,
          startTime: inicio,
          endTime: fin,
          leftPct,
          widthPct,
          progressLabel: `${formatearDuracion(Math.min(currentTime, fin) - inicio)} / ${formatearDuracion(duracion)}h`,
          color: obtenerColorTarea(tarea, rowIndex + index),
        };
      });

    return {
      id: recurso.id,
      nombre: recurso.label,
      bars,
    };
  });

  return {
    resourceStates,
    pendingQueue,
    runningTasks,
    completedTasks,
    ganttRows,
    currentTask: runningTasks[0] ?? null,
    nextTask: pendingQueue[0] ?? upcomingTasks[0] ?? null,
    finalTime: obtenerTiempoFinal(tareasSimuladas),
  };
};

/** @param {Record<string, string>} recursosBackend */
const crearVistaRecursosBackend = (recursosBackend) =>
  RECURSOS_BASE.map((recurso) => {
    const estadoBruto = recursosBackend?.[recurso.id] ?? "libre";
    const libre = estadoBruto === "libre";

    return {
      id: recurso.id,
      nombre: recurso.label,
      estado: libre ? "Libre" : "Ocupado",
      detalle: libre ? "Sin actividad" : `En uso: ${estadoBruto}`,
      tareaActual: null,
      cola: [],
    };
  });

/** @param {{ usuario: Usuario }} props */
export default function Dashboard({ usuario }) {
  const { showSnackbar } = useSnackbar();
  const [tareas, setTareas] = useState(/** @type {Tarea[]} */ ([]));
  const [recursos, setRecursos] = useState(/** @type {RecursoMapa} */ ({}));
  const [resultado, setResultado] = useState(
    /** @type {ResultadoSimulacion | null} */ (null),
  );
  const [simulacion, setSimulacion] = useState(
    /** @type {SimulationState} */ (SIMULATION_EMPTY),
  );
  const [algoritmo, setAlgoritmo] = useState(/** @type {Algoritmo} */ ("fcfs"));
  const [quantum, setQuantum] = useState(2);
  const [cargando, setCargando] = useState(false);
  const [mostrarConfirmLimpiar, setMostrarConfirmLimpiar] = useState(false);
  const [cargandoLimpiar, setCargandoLimpiar] = useState(false);
  const [mostrarModalNueva, setMostrarModalNueva] = useState(false);
  const [cargandoCrear, setCargandoCrear] = useState(false);
  const [paginaTareas, setPaginaTareas] = useState(1);
  const [nueva, setNueva] = useState(
    /** @type {TareaInput} */ ({
      nombre: "",
      tipo: "riego",
      duracion: 2,
      prioridad: 2,
      llegada: 6,
    }),
  );
  const intervaloRef = useRef(
    /** @type {ReturnType<typeof setInterval> | null} */ (null),
  );

  const tareasPendientes = tareas.filter((t) => t.estado === "pendiente");
  const tareasPorPagina = 6;
  const totalPaginas = Math.max(
    1,
    Math.ceil(tareasPendientes.length / tareasPorPagina),
  );
  const paginaActual = Math.min(paginaTareas, totalPaginas);
  const indiceInicio = (paginaActual - 1) * tareasPorPagina;
  const tareasVisibles = tareasPendientes.slice(
    indiceInicio,
    indiceInicio + tareasPorPagina,
  );

  const cargar = async () => {
    const [t, r] = await Promise.all([getTareas(), getRecursos()]);
    setTareas(t.data);
    setRecursos(r.data);
  };

  const limpiarIntervalo = () => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  };

  const reiniciarSimulacion = () => {
    limpiarIntervalo();
    setResultado(null);
    setSimulacion(SIMULATION_EMPTY);
  };

  /** @param {TareaSimulada[]} tareasSimuladas @param {"idle" | "running" | "paused" | "finished"} estado @param {"slow" | "normal" | "fast"} velocidad */
  const construirSimulacion = (
    tareasSimuladas,
    estado,
    velocidad = "normal",
  ) => {
    const snapshot = crearSnapshotSimulacion(tareasSimuladas, 0);
    return {
      ...SIMULATION_EMPTY,
      status: estado,
      speed: velocidad,
      currentTime: 0,
      tasks: tareasSimuladas,
      ...snapshot,
    };
  };

  const iniciarSimulacion = async () => {
    if (tareasPendientes.length === 0) return;

    setCargando(true);
    try {
      const res = await simular(algoritmo, quantum);
      const tareasSimuladas = /** @type {TareaSimulada[]} */ (
        res.data.tareas || []
      );
      setResultado(res.data);
      setSimulacion(
        construirSimulacion(tareasSimuladas, "running", simulacion.speed),
      );
      showSnackbar(
        `Simulación preparada con ${ALGORITMO_LABELS[algoritmo]}`,
        "success",
        3500,
      );
    } catch (e) {
      const error =
        /** @type {{ response?: { data?: { detail?: string } } }} */ (e);
      showSnackbar(
        error.response?.data?.detail || "Error en simulación",
        "error",
      );
    } finally {
      setCargando(false);
    }
  };

  const alternarSimulacion = async () => {
    if (simulacion.status === "running") {
      setSimulacion((prev) => ({ ...prev, status: "paused" }));
      return;
    }

    if (simulacion.status === "paused") {
      setSimulacion((prev) => ({ ...prev, status: "running" }));
      return;
    }

    if (simulacion.status === "finished") {
      reiniciarSimulacion();
      return;
    }

    await iniciarSimulacion();
  };

  /** @param {SimulationSpeed} velocidad */
  const actualizarVelocidad = (velocidad) => {
    setSimulacion((prev) => ({ ...prev, speed: velocidad }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      cargar();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    limpiarIntervalo();

    if (simulacion.status !== "running" || simulacion.tasks.length === 0) {
      return undefined;
    }

    const intervalo = SPEEDS[simulacion.speed].delay;
    intervaloRef.current = setInterval(() => {
      setSimulacion((prev) => {
        if (prev.status !== "running") return prev;
        if (prev.currentTime >= prev.finalTime) {
          return { ...prev, status: "finished" };
        }

        const siguienteTiempo = prev.currentTime + 1;
        const snapshot = crearSnapshotSimulacion(prev.tasks, siguienteTiempo);
        const finalizo = siguienteTiempo >= snapshot.finalTime;

        return {
          ...prev,
          currentTime: siguienteTiempo,
          ...snapshot,
          status: finalizo ? "finished" : "running",
        };
      });
    }, intervalo);

    return limpiarIntervalo;
  }, [simulacion.status, simulacion.speed, simulacion.tasks]);

  useEffect(() => {
    if (simulacion.status === "finished") {
      showSnackbar("Simulación completada", "success", 3500);
    }
  }, [simulacion.status, showSnackbar]);

  const handleCrear = async () => {
    if (!nueva.nombre.trim()) return;
    setCargandoCrear(true);
    try {
      await crearTarea(nueva);
      reiniciarSimulacion();
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
      showSnackbar(
        "Error al crear tarea: " + (error.message || "desconocido"),
        "error",
      );
    } finally {
      setCargandoCrear(false);
    }
  };

  /** @param {number} id */
  const handleEliminar = async (id) => {
    try {
      await eliminarTarea(id);
      reiniciarSimulacion();
      setPaginaTareas(1);
      await cargar();
      showSnackbar("Tarea eliminada", "info");
    } catch {
      showSnackbar("Error al eliminar tarea", "error");
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
      reiniciarSimulacion();
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

  const recursosVista =
    simulacion.status === "idle"
      ? crearVistaRecursosBackend(recursos)
      : simulacion.resourceStates;

  const estadoSimulacion =
    simulacion.status === "running"
      ? "En ejecución"
      : simulacion.status === "paused"
        ? "Pausada"
        : simulacion.status === "finished"
          ? "Finalizada"
          : "Lista";

  const etiquetaBoton =
    simulacion.status === "running"
      ? "Pausar"
      : simulacion.status === "paused"
        ? "Reanudar"
        : simulacion.status === "finished"
          ? "Reiniciar"
          : "Simular";

  const iconoBoton =
    simulacion.status === "running"
      ? Pause
      : simulacion.status === "finished"
        ? RotateCcw
        : Play;

  const IconBtn = iconoBoton;

  const tiempoActual = simulacion.currentTime;
  const tareaActual = simulacion.currentTask;
  const siguienteTarea = simulacion.nextTask;
  const velocidadActual = SPEEDS[simulacion.speed];

  return (
    <div className="min-h-screen bg-crema">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <h2 className="font-fraunces text-3xl sm:text-4xl font-bold text-verde-musgo mb-8">
          Dashboard — Ingeniero
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_0.9fr_0.9fr] gap-4 sm:gap-6 items-stretch">
          {/* Columna 1: Presets */}
          <div className="min-w-0 h-full">
            <div className="h-full space-y-4">
              {usuario.rol === "ingeniero" && (
                <TaskPresets
                  usuario={usuario}
                  tareas={tareas}
                  onCargarPreset={() => {
                    reiniciarSimulacion();
                    setPaginaTareas(1);
                    cargar();
                  }}
                />
              )}
            </div>
          </div>

          {/* Columna 2: Simulación */}
          <div className="min-w-0 h-full">
            <div className="h-full space-y-4">
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
                      onChange={(e) =>
                        setAlgoritmo(/** @type {Algoritmo} */ (e.target.value))
                      }
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

                  <div>
                    <label className="block text-xs font-medium text-tierra-oscura mb-2">
                      Velocidad de simulación
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(SPEEDS).map(([clave, config]) => {
                        const activo = simulacion.speed === clave;
                        return (
                          <button
                            key={clave}
                            type="button"
                            onClick={() =>
                              actualizarVelocidad(
                                /** @type {"slow" | "normal" | "fast"} */ (
                                  clave
                                ),
                              )
                            }
                            className={`rounded-lg border px-3 py-2 text-left transition-all duration-200 ${activo ? "bg-verde-musgo text-crema border-verde-musgo" : "bg-blanco-hueso text-tierra-oscura border-arena hover:border-verde-oliva/40"}`}
                          >
                            <span className="block text-sm font-semibold">
                              {config.label}
                            </span>
                            <span className="block text-[11px] opacity-75">
                              {config.delay} ms
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={alternarSimulacion}
                    disabled={
                      cargando ||
                      (simulacion.status === "idle" &&
                        tareasPendientes.length === 0)
                    }
                    className="w-full flex items-center justify-center gap-2 bg-dorado-trigo text-blanco-hueso font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IconBtn size={16} />
                    {cargando ? "Preparando..." : etiquetaBoton}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="rounded-xl border border-arena bg-arena/40 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-tierra-oscura/60 font-semibold flex items-center gap-1.5">
                        <Clock3 size={14} /> Tiempo simulado
                      </p>
                      <p className="text-2xl font-bold text-verde-musgo mt-1">
                        T = {tiempoActual}
                      </p>
                      <p className="text-xs text-tierra-oscura/70 mt-1">
                        {estadoSimulacion}
                      </p>
                    </div>
                    <div className="rounded-xl border border-arena bg-arena/40 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-tierra-oscura/60 font-semibold flex items-center gap-1.5">
                        <Activity size={14} /> Velocidad
                      </p>
                      <p className="text-lg font-bold text-dorado-trigo mt-1">
                        {velocidadActual.label}
                      </p>
                      <p className="text-xs text-tierra-oscura/70 mt-1">
                        Tick real: {velocidadActual.delay} ms
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-1">
                    <div className="rounded-xl border border-verde-oliva/20 bg-verde-oliva/5 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-tierra-oscura/60 font-semibold flex items-center gap-1.5">
                        <ListChecks size={14} /> En ejecución
                      </p>
                      <p className="text-sm font-semibold text-verde-musgo mt-1 truncate">
                        {tareaActual
                          ? tareaActual.nombre
                          : "Sin tareas en ejecución"}
                      </p>
                      <p className="text-xs text-tierra-oscura/70 mt-1">
                        {simulacion.runningTasks.length > 1
                          ? `+ ${simulacion.runningTasks.length - 1} tarea${simulacion.runningTasks.length - 1 !== 1 ? "s" : ""} simultánea${simulacion.runningTasks.length - 1 !== 1 ? "s" : ""}`
                          : "Control visual por tick"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-dorado-trigo/20 bg-dorado-trigo/10 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-tierra-oscura/60 font-semibold flex items-center gap-1.5">
                        <Activity size={14} /> Siguiente en cola
                      </p>
                      <p className="text-sm font-semibold text-dorado-trigo mt-1 truncate">
                        {siguienteTarea
                          ? siguienteTarea.nombre
                          : "No hay tareas en espera"}
                      </p>
                      <p className="text-xs text-tierra-oscura/70 mt-1">
                        {simulacion.pendingQueue.length > 0
                          ? `${simulacion.pendingQueue.length} tarea${simulacion.pendingQueue.length !== 1 ? "s" : ""} en cola`
                          : "La cola se vacía al avanzar el reloj"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Columna 3: Recursos */}
          <div className="min-w-0 h-full">
            <div className="h-full space-y-4">
              <section className="card">
                <h3 className="font-fraunces font-bold text-tierra-oscura mb-4 flex items-center gap-2">
                  🔧 Recursos
                </h3>
                <RecursoStatus recursos={recursosVista} />
              </section>
            </div>
          </div>
        </div>

        {/* Debajo de las columnas: Lista de tareas */}
        <section className="space-y-4 mt-6">
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
                onClick={() =>
                  setPaginaTareas((p) =>
                    Math.max(1, Math.min(p, totalPaginas) - 1),
                  )
                }
                disabled={paginaActual === 1}
                className="p-2 rounded-lg border border-arena bg-blanco-hueso text-tierra-oscura hover:bg-arena transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="text-xs text-tierra-oscura opacity-70 font-medium">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() =>
                  setPaginaTareas((p) =>
                    Math.min(totalPaginas, Math.min(p, totalPaginas) + 1),
                  )
                }
                disabled={paginaActual === totalPaginas}
                className="p-2 rounded-lg border border-arena bg-blanco-hueso text-tierra-oscura hover:bg-arena transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>

        {(simulacion.ganttRows.length > 0 || resultado) && (
          <section className="mt-8">
            {resultado && (
              <div className="mb-3">
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
            )}

            <GanttChart
              rows={simulacion.ganttRows}
              currentTime={simulacion.currentTime}
              totalTime={simulacion.finalTime}
            />
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
