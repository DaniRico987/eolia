import React from "react";
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { useSnackbar } from "../hooks/useSnackbar";

import type { LucideIcon } from "lucide-react";
import type { Snackbar as SnackbarType, TipoSnackbar } from "../types";

const SNACKBAR_STYLES: Record<
  TipoSnackbar,
  { bg: string; icon: LucideIcon; border: string }
> = {
  success: {
    bg: "bg-verde-musgo",
    icon: CheckCircle2,
    border: "border-verde-oliva",
  },
  error: {
    bg: "bg-red-700",
    icon: XCircle,
    border: "border-red-800",
  },
  warning: {
    bg: "bg-dorado-trigo",
    icon: TriangleAlert,
    border: "border-amber-700",
  },
  info: {
    bg: "bg-verde-oliva",
    icon: Info,
    border: "border-verde-musgo",
  },
};

function Snackbar({
  snackbar,
  onClose,
}: {
  snackbar: SnackbarType;
  onClose: () => void;
}) {
  const style = SNACKBAR_STYLES[snackbar.type] || SNACKBAR_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className={`animate-slide-in-right ${style.bg} border-l-4 ${style.border} text-crema px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-72 max-w-sm`}
      role="alert"
    >
      <Icon size={18} className="flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{snackbar.message}</p>
      <button
        onClick={onClose}
        className="text-crema hover:opacity-80 flex-shrink-0 ml-2"
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function SnackbarContainer() {
  const { snackbars, removeSnackbar } = useSnackbar();

  return (
    <div
      className="fixed bottom-6 right-6 space-y-2 z-50 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-atomic="true"
    >
      {snackbars.map((snackbar) => (
        <div key={snackbar.id} className="pointer-events-auto">
          <Snackbar
            snackbar={snackbar}
            onClose={() => removeSnackbar(snackbar.id)}
          />
        </div>
      ))}
    </div>
  );
}
