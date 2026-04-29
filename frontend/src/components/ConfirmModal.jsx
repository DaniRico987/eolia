import { AlertTriangle, Loader2 } from "lucide-react";

/** @param {{ titulo: string; mensaje: string; botonConfirmar?: string; onConfirmar: () => void | Promise<void>; onCancelar: () => void; cargando?: boolean }} props */
export default function ConfirmModal({ titulo, mensaje, botonConfirmar = "Eliminar", onConfirmar, onCancelar, cargando = false }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card bg-blanco-hueso max-w-sm w-full animate-slide-in-right">
        <div className="flex gap-3">
          <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="font-fraunces text-lg font-bold text-tierra-oscura mb-1">{titulo}</h2>
            <p className="text-sm text-tierra-oscura opacity-70">{mensaje}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="btn-primary bg-arena text-tierra-oscura hover:bg-verde-musgo/10 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            className="btn-destructive"
          >
            {cargando ? (
              <>
                <Loader2 size={16} className="animate-spin" /> {botonConfirmar}...
              </>
            ) : (
              botonConfirmar
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
