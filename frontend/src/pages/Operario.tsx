import React, { useEffect, useMemo, useState } from "react";
import { getTareas } from "../api/client";
import TareaCard from "../components/TareaCard";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Clock3,
  Eye,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import type { Tarea } from "../types";

type FiltroEstado = "todos" | Tarea["estado"];

const FILTROS: Array<{
  value: FiltroEstado;
  label: string;
  icon: React.ElementType;
}> = [
  { value: "todos", label: "Todas", icon: Sparkles },
  { value: "pendiente", label: "Pendientes", icon: Clock },
  { value: "ejecutando", label: "En curso", icon: Zap },
  { value: "esperando", label: "En espera", icon: Eye },
  { value: "interrumpida", label: "Interrumpidas", icon: ShieldAlert },
  { value: "completada", label: "Completadas", icon: CheckCircle },
];

const ESTADO_META: Record<
  Tarea["estado"],
  { label: string; color: string; ring: string }
> = {
  pendiente: {
    label: "Pendiente",
    color: "bg-amber-100 text-amber-900",
    ring: "border-amber-200",
  },
  ejecutando: {
    label: "En ejecucion",
    color: "bg-emerald-100 text-emerald-900",
    ring: "border-emerald-200",
  },
  completada: {
    label: "Completada",
    color: "bg-green-100 text-green-800",
    ring: "border-green-200",
  },
  interrumpida: {
    label: "Interrumpida",
    color: "bg-red-100 text-red-800",
    ring: "border-red-200",
  },
  esperando: {
    label: "En espera",
    color: "bg-sky-100 text-sky-800",
    ring: "border-sky-200",
  },
};

const GRUPO_CONFIG: Record<
  Tarea["estado"],
  { titulo: string; icono: React.ElementType; vacio: string }
> = {
  pendiente: {
    titulo: "Prontas para iniciar",
    icono: Clock,
    vacio: "No hay tareas pendientes en este momento.",
  },
  ejecutando: {
    titulo: "En ejecucion",
    icono: Zap,
    vacio: "Ninguna tarea se esta ejecutando ahora.",
  },
  esperando: {
    titulo: "En espera",
    icono: Eye,
    vacio: "No hay tareas esperando recursos o turno.",
  },
  interrumpida: {
    titulo: "Interrumpidas",
    icono: ShieldAlert,
    vacio: "No hay tareas interrumpidas.",
  },
  completada: {
    titulo: "Completadas",
    icono: CheckCircle,
    vacio: "Todavia no hay tareas completadas.",
  },
};

const ESTADOS_TAREA: Tarea["estado"][] = [
  "pendiente",
  "ejecutando",
  "esperando",
  "interrumpida",
  "completada",
];

const TAREAS_POR_PAGINA = 4;

export default function Operario() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [tareaSeleccionadaId, setTareaSeleccionadaId] = useState<number | null>(
    null,
  );
  const [detalleMovilAbierto, setDetalleMovilAbierto] = useState(false);
  const [paginasPorEstado, setPaginasPorEstado] = useState<
    Record<Tarea["estado"], number>
  >({
    pendiente: 1,
    ejecutando: 1,
    esperando: 1,
    interrumpida: 1,
    completada: 1,
  });
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(
    null,
  );

  const cargar = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTareas();
      setTareas(res.data);
      setUltimaActualizacion(new Date());
    } catch {
      setError("No se pudieron cargar las tareas. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const tareasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return tareas
      .filter((tarea) =>
        filtroEstado === "todos" ? true : tarea.estado === filtroEstado,
      )
      .filter((tarea) => {
        if (!termino) return true;

        return [
          tarea.nombre,
          tarea.tipo,
          tarea.estado,
          String(tarea.prioridad),
          String(tarea.duracion),
        ]
          .join(" ")
          .toLowerCase()
          .includes(termino);
      })
      .sort((a, b) => {
        if (a.estado !== b.estado) {
          if (a.estado === "ejecutando") return -1;
          if (b.estado === "ejecutando") return 1;
          if (a.estado === "pendiente") return -1;
          if (b.estado === "pendiente") return 1;
        }

        return (
          b.prioridad - a.prioridad || a.llegada - b.llegada || a.id - b.id
        );
      });
  }, [busqueda, filtroEstado, tareas]);

  const tareasPorEstado = useMemo(
    () =>
      tareasFiltradas.reduce(
        (acumulado, tarea) => {
          acumulado[tarea.estado].push(tarea);
          return acumulado;
        },
        {
          pendiente: [] as Tarea[],
          ejecutando: [] as Tarea[],
          completada: [] as Tarea[],
          interrumpida: [] as Tarea[],
          esperando: [] as Tarea[],
        },
      ),
    [tareasFiltradas],
  );

  const proximaTarea =
    tareasFiltradas.find((t) => t.estado === "ejecutando") ??
    tareasFiltradas.find((t) => t.estado === "pendiente") ??
    tareasFiltradas[0] ??
    null;

  const tareaSeleccionada =
    tareasFiltradas.find((tarea) => tarea.id === tareaSeleccionadaId) ??
    proximaTarea;

  useEffect(() => {
    if (tareasFiltradas.length === 0) {
      setTareaSeleccionadaId(null);
      setDetalleMovilAbierto(false);
      return;
    }

    const seleccionExiste = tareasFiltradas.some(
      (tarea) => tarea.id === tareaSeleccionadaId,
    );

    if (!seleccionExiste) {
      setTareaSeleccionadaId(proximaTarea?.id ?? tareasFiltradas[0].id);
    }
  }, [proximaTarea?.id, tareaSeleccionadaId, tareasFiltradas]);

  useEffect(() => {
    if (!tareaSeleccionadaId) return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;

    setDetalleMovilAbierto(true);
  }, [tareaSeleccionadaId]);

  useEffect(() => {
    setPaginasPorEstado((actual) => {
      let cambio = false;
      const siguiente = { ...actual };

      ESTADOS_TAREA.forEach((estado) => {
        const totalPaginas = Math.max(
          1,
          Math.ceil(tareasPorEstado[estado].length / TAREAS_POR_PAGINA),
        );
        const paginaAjustada = Math.min(actual[estado], totalPaginas);

        if (paginaAjustada !== actual[estado]) {
          siguiente[estado] = paginaAjustada;
          cambio = true;
        }
      });

      return cambio ? siguiente : actual;
    });
  }, [tareasPorEstado]);

  const [paginaGlobal, setPaginaGlobal] = useState(1);

  useEffect(() => {
    const total = Math.max(
      1,
      Math.ceil(tareasFiltradas.length / TAREAS_POR_PAGINA),
    );
    setPaginaGlobal((p) => Math.min(p, total));
  }, [tareasFiltradas]);

  const pendientes = tareas.filter((t) => t.estado === "pendiente");
  const enProceso = tareas.filter((t) => t.estado === "ejecutando");
  const completadas = tareas.filter((t) => t.estado === "completada");
  const interrumpidas = tareas.filter((t) => t.estado === "interrumpida");
  const esperando = tareas.filter((t) => t.estado === "esperando");

  const gruposVisibles =
    filtroEstado === "todos"
      ? (Object.keys(GRUPO_CONFIG) as Tarea["estado"][])
      : [filtroEstado];

  const formatearActualizacion = (fecha: Date | null): string => {
    if (!fecha) return "Sin actualizar";

    return fecha.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hayFiltrosActivos =
    filtroEstado !== "todos" || busqueda.trim().length > 0;

  const detalleTarea = tareaSeleccionada ? (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tierra-oscura/55">
            Seleccionada
          </p>
          <h4 className="mt-1 font-fraunces text-2xl font-semibold text-tierra-oscura">
            {tareaSeleccionada.nombre}
          </h4>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_META[tareaSeleccionada.estado].color}`}
        >
          {ESTADO_META[tareaSeleccionada.estado].label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-crema px-4 py-3">
          <span className="block text-tierra-oscura/55">Tipo</span>
          <strong className="capitalize">{tareaSeleccionada.tipo}</strong>
        </div>
        <div className="rounded-2xl bg-crema px-4 py-3">
          <span className="block text-tierra-oscura/55">Prioridad</span>
          <strong>{tareaSeleccionada.prioridad}</strong>
        </div>
        <div className="rounded-2xl bg-crema px-4 py-3">
          <span className="block text-tierra-oscura/55">Duracion</span>
          <strong>{tareaSeleccionada.duracion}h</strong>
        </div>
        <div className="rounded-2xl bg-crema px-4 py-3">
          <span className="block text-tierra-oscura/55">Llegada</span>
          <strong>{tareaSeleccionada.llegada}h</strong>
        </div>
      </div>

      <div className="rounded-2xl border border-arena bg-white px-4 py-3 text-sm text-tierra-oscura/75">
        <p>
          <strong>Espera:</strong> {tareaSeleccionada.tiempo_espera}h
        </p>
        <p>
          <strong>Retorno:</strong> {tareaSeleccionada.tiempo_retorno}h
        </p>
        <p>
          <strong>Estado:</strong> {tareaSeleccionada.estado}
        </p>
      </div>

      <p className="text-sm text-tierra-oscura/65">
        Toca otra tarjeta para cambiar el foco de trabajo y priorizar la
        inspeccion.
      </p>
    </div>
  ) : (
    <p className="text-sm text-tierra-oscura/65">
      No hay tarea seleccionada. Elige una tarjeta de la lista para ver su
      detalle.
    </p>
  );

  const cambiarPagina = (estado: Tarea["estado"], delta: number) => {
    setPaginasPorEstado((actual) => ({
      ...actual,
      [estado]: Math.max(1, actual[estado] + delta),
    }));
  };

  return (
    <div className="relatyive min-h-full overflow-hidden p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(107,124,69,0.16),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(196,146,42,0.18),_transparent_26%),linear-gradient(180deg,_rgba(245,240,232,0.95),_rgba(253,250,245,1))]" />

      <div className="mx-auto max-w-7xl space-y-6">
        <section className="card relative overflow-hidden border-arena/80 bg-blanco-hueso/95 p-0 shadow-[0_24px_60px_rgba(44,26,14,0.08)]">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-dorado-trigo/10 blur-3xl" />
          <div className="absolute -bottom-10 left-0 h-24 w-24 rounded-full bg-verde-oliva/10 blur-3xl" />
          <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:items-center">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="font-fraunces text-3xl sm:text-4xl font-bold text-verde-musgo">
                  Bienvenido
                </h2>
                <p className="max-w-2xl text-sm sm:text-base text-tierra-oscura/75">
                  Priorizacion clara de tareas, seguimiento de estados y acceso
                  rapido a lo que necesita atencion ahora.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Pendientes",
                    value: pendientes.length,
                    icon: Clock,
                    tone: "text-amber-700",
                  },
                  {
                    label: "En curso",
                    value: enProceso.length,
                    icon: Zap,
                    tone: "text-emerald-700",
                  },
                  {
                    label: "Interrumpidas",
                    value: interrumpidas.length,
                    icon: ShieldAlert,
                    tone: "text-red-700",
                  },
                  {
                    label: "Completadas",
                    value: completadas.length,
                    icon: CheckCircle,
                    tone: "text-green-700",
                  },
                ].map((item) => {
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-arena bg-white/80 p-4 shadow-subtle"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tierra-oscura/55">
                            {item.label}
                          </p>
                          <p className="mt-1 text-2xl font-bold text-tierra-oscura">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-arena bg-verde-musgo p-5 text-crema shadow-subtle h-auto">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-crema/70">
                    Proxima tarea
                  </p>
                  <h3 className="mt-1 font-fraunces text-2xl font-semibold">
                    {proximaTarea ? proximaTarea.nombre : "Sin tareas visibles"}
                  </h3>
                </div>
              </div>

              {proximaTarea ? (
                <div className="space-y-3 text-sm text-crema/85">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_META[proximaTarea.estado].color}`}
                    >
                      {ESTADO_META[proximaTarea.estado].label}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                      Prioridad {proximaTarea.prioridad}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                      {proximaTarea.tipo}
                    </span>
                  </div>
                  <p>
                    Llegada {proximaTarea.llegada}h · Duracion{" "}
                    {proximaTarea.duracion}h · Espera{" "}
                    {proximaTarea.tiempo_espera}h
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-crema/70">
                    Ultima sincronizacion:{" "}
                    {formatearActualizacion(ultimaActualizacion)}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-crema/80">
                  Usa los filtros para enfocar el turno o refresca la
                  informacion.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          <div className="space-y-4">
            <div className="card space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-fraunces text-xl font-semibold text-tierra-oscura">
                    Bandeja de trabajo
                  </h3>
                  <p className="text-sm text-tierra-oscura/65">
                    {hayFiltrosActivos
                      ? `${tareasFiltradas.length} tarea${tareasFiltradas.length === 1 ? "" : "s"} coinciden con tu busqueda.`
                      : "Tareas organizadas por estado, con prioridad visual para lo mas urgente."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="flex items-center gap-2 rounded-2xl border border-arena bg-white px-4 py-3 shadow-subtle">
                    <Search size={16} className="text-tierra-oscura/55" />
                    <input
                      type="search"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar tarea, tipo o prioridad"
                      className="w-56 bg-transparent text-sm outline-none placeholder:text-tierra-oscura/45"
                    />
                  </label>

                  <button
                    onClick={cargar}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-verde-musgo px-4 py-3 text-sm font-semibold text-crema transition-colors hover:bg-verde-oliva"
                  >
                    <RefreshCw
                      size={16}
                      className={loading ? "animate-spin" : ""}
                    />
                    Actualizar
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {FILTROS.map((filtro) => {
                  const Icon = filtro.icon;
                  const activo = filtroEstado === filtro.value;

                  return (
                    <button
                      key={filtro.value}
                      onClick={() => setFiltroEstado(filtro.value)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        activo
                          ? "border-verde-musgo bg-verde-musgo text-crema"
                          : "border-arena bg-white text-tierra-oscura hover:border-verde-oliva hover:text-verde-musgo"
                      }`}
                    >
                      <Icon size={15} />
                      {filtro.label}
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold">Error de carga</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl border border-arena bg-white p-4 shadow-subtle"
                    >
                      <div className="h-4 w-1/2 rounded bg-arena" />
                      <div className="mt-4 h-3 w-3/4 rounded bg-arena/70" />
                      <div className="mt-3 h-3 w-1/3 rounded bg-arena/60" />
                    </div>
                  ))}
                </div>
              ) : tareasFiltradas.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-arena bg-white/80 p-8 text-center">
                  <p className="font-fraunces text-xl font-semibold text-tierra-oscura">
                    No hay resultados
                  </p>
                  <p className="mt-2 text-sm text-tierra-oscura/65">
                    Prueba con otro filtro, cambia la busqueda o refresca la
                    vista.
                  </p>
                  <button
                    onClick={() => {
                      setBusqueda("");
                      setFiltroEstado("todos");
                    }}
                    className="mt-4 rounded-full bg-verde-musgo px-4 py-2 text-sm font-semibold text-crema hover:bg-verde-oliva"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtroEstado === "todos"
                    ? (() => {
                        const totalGlobal = Math.max(
                          1,
                          Math.ceil(tareasFiltradas.length / TAREAS_POR_PAGINA),
                        );
                        const inicioGlobal =
                          (paginaGlobal - 1) * TAREAS_POR_PAGINA;
                        const tareasPaginadasGlobal = tareasFiltradas.slice(
                          inicioGlobal,
                          inicioGlobal + TAREAS_POR_PAGINA,
                        );

                        return (
                          <>
                            <div className="space-y-2.5">
                              {tareasPaginadasGlobal.map((tarea) => (
                                <TareaCard
                                  key={tarea.id}
                                  tarea={tarea}
                                  puedeEliminar={false}
                                  onSeleccionar={(seleccionada) =>
                                    setTareaSeleccionadaId(seleccionada.id)
                                  }
                                  seleccionada={
                                    tareaSeleccionadaId === tarea.id
                                  }
                                />
                              ))}

                              {tareasFiltradas.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-arena bg-white/70 p-4 text-sm text-tierra-oscura/60">
                                  No hay tareas visibles
                                </div>
                              )}
                            </div>

                            {tareasFiltradas.length > TAREAS_POR_PAGINA && (
                              <div className="flex items-center justify-between gap-3 rounded-2xl border border-arena bg-white/80 px-3 py-1.5 text-sm shadow-subtle">
                                <button
                                  onClick={() =>
                                    setPaginaGlobal((p) => Math.max(1, p - 1))
                                  }
                                  disabled={paginaGlobal === 1}
                                  className="rounded-full px-3 py-1.5 font-medium text-tierra-oscura transition disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Anterior
                                </button>
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-tierra-oscura/55">
                                  Pagina {paginaGlobal} de {totalGlobal}
                                </span>
                                <button
                                  onClick={() =>
                                    setPaginaGlobal((p) =>
                                      Math.min(totalGlobal, p + 1),
                                    )
                                  }
                                  disabled={paginaGlobal === totalGlobal}
                                  className="rounded-full px-3 py-1.5 font-medium text-tierra-oscura transition disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Siguiente
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()
                    : gruposVisibles.map((estado) => {
                        const tareasGrupo = tareasPorEstado[estado];
                        const grupo = GRUPO_CONFIG[estado];
                        const Icon = grupo.icono;
                        const paginaActual = paginasPorEstado[estado];
                        const totalPaginas = Math.max(
                          1,
                          Math.ceil(tareasGrupo.length / TAREAS_POR_PAGINA),
                        );
                        const inicio = (paginaActual - 1) * TAREAS_POR_PAGINA;
                        const tareasPaginadas = tareasGrupo.slice(
                          inicio,
                          inicio + TAREAS_POR_PAGINA,
                        );
                        const mostrarPaginacion =
                          tareasGrupo.length > TAREAS_POR_PAGINA;

                        return (
                          <section key={estado} className="space-y-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="flex items-center gap-2 font-fraunces text-lg font-semibold text-tierra-oscura">
                                <Icon size={18} className="text-dorado-trigo" />
                                {grupo.titulo}
                                <span className="text-sm font-medium text-tierra-oscura/55">
                                  ({tareasGrupo.length})
                                </span>
                              </h4>
                            </div>

                            <div className="space-y-2.5">
                              {tareasPaginadas.map((tarea) => (
                                <TareaCard
                                  key={tarea.id}
                                  tarea={tarea}
                                  puedeEliminar={false}
                                  onSeleccionar={(seleccionada) =>
                                    setTareaSeleccionadaId(seleccionada.id)
                                  }
                                  seleccionada={
                                    tareaSeleccionadaId === tarea.id
                                  }
                                />
                              ))}

                              {tareasGrupo.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-arena bg-white/70 p-4 text-sm text-tierra-oscura/60">
                                  {grupo.vacio}
                                </div>
                              )}
                            </div>

                            {mostrarPaginacion && (
                              <div className="flex items-center justify-between gap-3 rounded-2xl border border-arena bg-white/80 px-3 py-1.5 text-sm shadow-subtle">
                                <button
                                  onClick={() => cambiarPagina(estado, -1)}
                                  disabled={paginaActual === 1}
                                  className="rounded-full px-3 py-1.5 font-medium text-tierra-oscura transition disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Anterior
                                </button>
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-tierra-oscura/55">
                                  Pagina {paginaActual} de {totalPaginas}
                                </span>
                                <button
                                  onClick={() => cambiarPagina(estado, 1)}
                                  disabled={paginaActual === totalPaginas}
                                  className="rounded-full px-3 py-1.5 font-medium text-tierra-oscura transition disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Siguiente
                                </button>
                              </div>
                            )}
                          </section>
                        );
                      })}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card space-y-4 hidden lg:block">
              <h3 className="font-fraunces text-xl font-semibold text-tierra-oscura">
                Ficha de tarea
              </h3>

              {detalleTarea}
            </div>

            <div className="card space-y-4">
              <h3 className="font-fraunces text-xl font-semibold text-tierra-oscura">
                Alertas del turno
              </h3>

              <div className="space-y-3 text-sm text-tierra-oscura/75">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="font-semibold text-amber-900">
                    Pendientes de iniciar
                  </p>
                  <p className="mt-1 text-amber-900/80">
                    {pendientes.length} tarea
                    {pendientes.length === 1 ? "" : "s"} requieren atencion.
                  </p>
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
                  <p className="font-semibold text-sky-900">En espera</p>
                  <p className="mt-1 text-sky-900/80">
                    {esperando.length} tarea{esperando.length === 1 ? "" : "s"}{" "}
                    esperan recursos o turno.
                  </p>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="font-semibold text-red-900">Interrupciones</p>
                  <p className="mt-1 text-red-900/80">
                    {interrumpidas.length} tarea
                    {interrumpidas.length === 1 ? "" : "s"} necesitan revision.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={cargar}
              className="w-full rounded-2xl border border-verde-musgo/20 bg-white px-4 py-4 text-sm font-semibold text-verde-musgo shadow-subtle transition-colors hover:border-verde-musgo hover:bg-verde-musgo hover:text-crema"
            >
              {loading ? "Actualizando..." : "Refrescar informacion"}
            </button>
          </aside>
        </section>
      </div>

      <button
        onClick={() => setDetalleMovilAbierto(true)}
        className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-verde-musgo px-4 py-3 text-sm font-semibold text-crema shadow-subtle lg:hidden"
      >
        Ver tarea
      </button>

      <div
        className={`fixed inset-0 z-40 bg-tierra-oscura/40 transition-opacity lg:hidden ${
          detalleMovilAbierto
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDetalleMovilAbierto(false)}
      >
        <div
          className={`absolute inset-x-0 bottom-0 rounded-t-[2rem] border border-arena bg-blanco-hueso p-4 shadow-[0_-24px_60px_rgba(44,26,14,0.2)] transition-transform ${
            detalleMovilAbierto ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-arena" />
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-fraunces text-xl font-semibold text-tierra-oscura">
              Ficha de tarea
            </h3>
            <button
              onClick={() => setDetalleMovilAbierto(false)}
              aria-label="Cerrar ficha de tarea"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-crema text-tierra-oscura transition hover:bg-arena"
            >
              <X size={18} />
            </button>
          </div>
          <div className="max-h-[68vh] overflow-y-auto pr-1">
            {detalleTarea}
          </div>
        </div>
      </div>
    </div>
  );
}
