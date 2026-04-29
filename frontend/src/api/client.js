import axios from "axios";
/** @typedef {import("../types").Tarea} Tarea */
/** @typedef {import("../types").TareaInput} TareaInput */
/** @typedef {import("../types").Usuario} Usuario */
/** @typedef {import("../types").RecursoMapa} RecursoMapa */
/** @typedef {import("../types").ResultadoSimulacion} ResultadoSimulacion */

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Inyecta el rol en cada request automáticamente
api.interceptors.request.use((config) => {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  if (usuario.rol) {
    config.params = { ...config.params, rol: usuario.rol };
  }
  return config;
});

/** @param {string} email @param {string} password @returns {Promise<import("axios").AxiosResponse<Usuario>>} */
export const login = (email, password) =>
  api.post("/login", { email, password });

/** @returns {Promise<import("axios").AxiosResponse<Tarea[]>>} */
export const getTareas = () => api.get("/tareas");

/** @param {TareaInput} tarea @returns {Promise<import("axios").AxiosResponse<Tarea>>} */
export const crearTarea = (tarea) => api.post("/tareas", tarea);

/** @param {number} id @returns {Promise<import("axios").AxiosResponse<void>>} */
export const eliminarTarea = (id) => api.delete(`/tareas/${id}`);

/** @param {import("../types").Algoritmo} algoritmo @param {number} [quantum=2.0] @returns {Promise<import("axios").AxiosResponse<ResultadoSimulacion>>} */
export const simular = (algoritmo, quantum = 2.0) =>
  api.post("/simular", { algoritmo, quantum });

/** @returns {Promise<import("axios").AxiosResponse<any>>} */
export const getHistorial = () => api.get("/simulaciones");

/** @returns {Promise<import("axios").AxiosResponse<RecursoMapa>>} */
export const getRecursos = () => api.get("/recursos");
