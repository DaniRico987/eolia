import { createContext, useContext } from "react";

import type { SnackbarContextValue } from "../types";

const SnackbarContext = createContext<SnackbarContextValue | undefined>(
  undefined,
);

export function useSnackbar(): SnackbarContextValue {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar debe usarse dentro de SnackbarProvider");
  }
  return context;
}

export { SnackbarContext };
