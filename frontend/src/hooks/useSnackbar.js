import { createContext, useContext } from "react";

/** @typedef {import("../types").SnackbarContextValue} SnackbarContextValue */

const SnackbarContext = createContext(/** @type {SnackbarContextValue | undefined} */ (undefined));

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar debe usarse dentro de SnackbarProvider");
  }
  return context;
}

export { SnackbarContext };
