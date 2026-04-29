import { useState, useCallback } from "react";
import { SnackbarContext } from "../hooks/useSnackbar";

/** @typedef {import("../types").Snackbar} Snackbar */
/** @typedef {import("../types").TipoSnackbar} TipoSnackbar */

/** @param {{ children: import("react").ReactNode }} props */
export function SnackbarProvider({ children }) {
  const [snackbars, setSnackbars] = useState(/** @type {Snackbar[]} */ ([]));

  const showSnackbar = useCallback(
    /** @param {string} message @param {TipoSnackbar} [type] @param {number} [duration] */
    (message, type = "info", duration = 3000) => {
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
    },
    []
  );

  const removeSnackbar = useCallback(
    /** @param {number} id */
    (id) => {
      setSnackbars((prev) => prev.filter((s) => s.id !== id));
    },
    []
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar, removeSnackbar, snackbars }}>
      {children}
    </SnackbarContext.Provider>
  );
}
