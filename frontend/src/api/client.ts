import axios, { type AxiosResponse } from "axios";
import type { Algoritmo, RecursoMapa, ResultadoSimulacion, Tarea, TareaInput, Usuario } from "../types";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  if (usuario.rol) {
    config.params = { ...config.params, rol: usuario.rol };
  }
  return config;
});

export const login = (email: string, password: string): Promise<AxiosResponse<Usuario>> => api.post("/login", { email, password });

export const getTareas = (): Promise<AxiosResponse<Tarea[]>> => api.get("/tareas");

export const crearTarea = (tarea: TareaInput): Promise<AxiosResponse<Tarea>> => api.post("/tareas", tarea);

export const eliminarTarea = (id: number): Promise<AxiosResponse<void>> => api.delete(`/tareas/${id}`);

export const simular = (algoritmo: Algoritmo, quantum = 2.0): Promise<AxiosResponse<ResultadoSimulacion>> => api.post("/simular", { algoritmo, quantum });

export const getHistorial = (): Promise<AxiosResponse<unknown>> => api.get("/simulaciones");

export const getRecursos = (): Promise<AxiosResponse<RecursoMapa>> => api.get("/recursos");
