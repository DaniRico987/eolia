import { useEffect, useState } from "react";
import { getTareas } from "../api/client";
import TareaCard from "../components/TareaCard";
import { RotateCw, Clock, Zap, CheckCircle } from "lucide-react";

/** @typedef {import("../types").Tarea} Tarea */
/** @typedef {import("../types").Usuario} Usuario */

/** @param {{ usuario: Usuario }} props */
export default function Operario({ usuario }) {
  const [tareas, setTareas] = useState(/** @type {Tarea[]} */ ([]));
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      const res = await getTareas();
      setTareas(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const pendientes = tareas.filter((t) => t.estado === "pendiente");
  const enProceso = tareas.filter((t) => t.estado === "ejecutando");
  const completadas = tareas.filter((t) => t.estado === "completada");

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h2 className="font-fraunces text-2xl sm:text-3xl font-bold text-verde-musgo">
        Vista Operario
      </h2>

      {loading ? (
        <p className="text-tierra-oscura opacity-70">Cargando tareas...</p>
      ) : (
        <>
          <section>
            <h3 className="flex items-center gap-2 font-fraunces text-lg font-semibold text-tierra-oscura mb-4">
              <Clock size={20} className="text-dorado-trigo" />
              Pendientes ({pendientes.length})
            </h3>
            <div className="space-y-3">
              {pendientes.map((t) => (
                <TareaCard key={t.id} tarea={t} puedeEliminar={false} />
              ))}
              {pendientes.length === 0 && (
                <p className="text-sm text-tierra-oscura opacity-60 italic">
                  Sin tareas pendientes
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-fraunces text-lg font-semibold text-tierra-oscura mb-4">
              <Zap size={20} className="text-verde-oliva" />
              En ejecución ({enProceso.length})
            </h3>
            <div className="space-y-3">
              {enProceso.map((t) => (
                <TareaCard key={t.id} tarea={t} puedeEliminar={false} />
              ))}
              {enProceso.length === 0 && (
                <p className="text-sm text-tierra-oscura opacity-60 italic">
                  Ninguna en ejecución
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-fraunces text-lg font-semibold text-tierra-oscura mb-4">
              <CheckCircle size={20} className="text-green-600" />
              Completadas ({completadas.length})
            </h3>
            <div className="space-y-3">
              {completadas.map((t) => (
                <TareaCard key={t.id} tarea={t} puedeEliminar={false} />
              ))}
              {completadas.length === 0 && (
                <p className="text-sm text-tierra-oscura opacity-60 italic">
                  Sin completadas aún
                </p>
              )}
            </div>
          </section>
        </>
      )}

      <button
        onClick={cargar}
        className="fixed bottom-8 right-8 bg-verde-musgo text-crema px-4 py-3 rounded-full shadow-subtle font-medium flex items-center gap-2 hover:bg-verde-oliva transition-colors"
      >
        <RotateCw size={18} /> Actualizar
      </button>
    </div>
  );
}
