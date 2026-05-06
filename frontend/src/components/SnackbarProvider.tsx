import React, { useCallback, useEffect, useRef, useState } from "react";
import { SnackbarContext } from "../hooks/useSnackbar";

import type {
  Snackbar,
  TipoSnackbar,
  SnackbarContextValue,
} from "../types";

interface Props {
  children: React.ReactNode;
}

export function SnackbarProvider({ children }: Props) {
  const [snackbars, setSnackbars] = useState<Snackbar[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const removeSnackbar = useCallback((id: number) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showSnackbar = useCallback(
    (message: string, type: TipoSnackbar = "info", duration = 3000) => {
      const id = Date.now() + Math.random();
      const newSnackbar: Snackbar = { id, message, type, duration };

      setSnackbars((prev) => {
        const updated = [...prev, newSnackbar];
        if (updated.length > 5) {
          const removed = updated[0];
          const oldTimer = timersRef.current.get(removed.id);
          if (oldTimer) {
            clearTimeout(oldTimer);
            timersRef.current.delete(removed.id);
          }
          return updated.slice(1);
        }
        return updated;
      });

      const timer = setTimeout(() => removeSnackbar(id), duration);
      timersRef.current.set(id, timer);

      return { id, clear: () => removeSnackbar(id) };
    },
    [removeSnackbar],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  const value: SnackbarContextValue = {
    showSnackbar,
    removeSnackbar,
    snackbars,
  };

  return (
    <SnackbarContext.Provider value={value}>{children}</SnackbarContext.Provider>
  );
}

export default SnackbarProvider;
