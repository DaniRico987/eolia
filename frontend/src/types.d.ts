export type RolUsuario = "ingeniero" | "operario";
export type EstadoTarea = "pendiente" | "ejecutando" | "completada" | "interrumpida" | "esperando";
export type TipoTarea = "riego" | "fumigacion" | "cosecha" | "fertilizacion" | "monitoreo";
export type Algoritmo = "fcfs" | "sjf" | "priority" | "round_robin";
export type EstadoRecurso = "libre" | string;
export type TipoSnackbar = "info" | "success" | "warning" | "error";

export interface Usuario {
  nombre: string;
  rol: RolUsuario;
  email?: string;
}

export interface Tarea {
  id: number;
  nombre: string;
  tipo: TipoTarea;
  duracion: number;
  prioridad: number;
  llegada: number;
  estado: EstadoTarea;
  inicio: number | null;
  fin: number | null;
  tiempo_espera: number;
  tiempo_retorno: number;
}

export interface TareaInput {
  nombre: string;
  tipo: TipoTarea;
  duracion: number;
  prioridad: number;
  llegada: number;
}

export interface RecursoMapa {
  [key: string]: EstadoRecurso;
}

export interface PresetTarea {
  nombre: string;
  tipo: TipoTarea;
  duracion: number;
  prioridad: number;
  llegada: number;
}

export interface PresetTareas {
  id: string | number;
  nombre: string;
  tareas: PresetTarea[];
  fechaCreacion: string;
  esDefault: boolean;
}

export interface MetricasSimulacion {
  [key: string]: number | string;
}

export interface ResultadoSimulacion {
  algoritmo: Algoritmo;
  metricas: MetricasSimulacion;
  tareas: Tarea[];
}

export interface Snackbar {
  id: number;
  message: string;
  type: TipoSnackbar;
  duration: number;
}

export interface SnackbarContextValue {
  showSnackbar: (message: string, type?: TipoSnackbar, duration?: number) => { id: number; clear: () => void };
  removeSnackbar: (id: number) => void;
  snackbars: Snackbar[];
}
