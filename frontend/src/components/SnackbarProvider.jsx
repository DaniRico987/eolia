import { useState } from "react";
import { SnackbarContext } from "../hooks/useSnackbar";

/** @typedef {import("../types").Snackbar} Snackbar */
/** @typedef {import("../types").TipoSnackbar} TipoSnackbar */

/** @param {{ children: import("react").ReactNode }} props */
export function SnackbarProvider({ children }) {
  const [snackbars, setSnackbars] = useState(/** @type {Snackbar[]} */ ([]));

  /** @param {number} id */
  const removeSnackbar = (id) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id));
  };

  /** @param {string} message @param {TipoSnackbar} [type] @param {number} [duration] */
  const showSnackbar = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    const newSnackbar = { id, message, type, duration };

    setSnackbars((prev) => {
      // Mantener máximo 5 snackbars visibles
      const updated = [...prev, newSnackbar];
      if (updated.length > 5) {
        // Remover el más antiguo
        return updated.slice(-5);
      }
      return updated;
    });

    // Auto-remover después del duration
    const timer = setTimeout(() => {
      removeSnackbar(id);
    }, duration);

    return { id, clear: () => clearTimeout(timer) };
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, removeSnackbar, snackbars }}>
      {children}
    </SnackbarContext.Provider>
  );
}
