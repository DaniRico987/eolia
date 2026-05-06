import React, { useState } from "react";
import { login } from "../api/client";
import EoliaLogo from "../components/EoliaLogo";
import type { Usuario } from "../types";

export default function Login({
  onLogin,
}: {
  onLogin: (user: Usuario) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await login(email, password);
      localStorage.setItem("usuario", JSON.stringify(res.data));
      onLogin(res.data);
    } catch {
      setError("Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crema flex items-center justify-center px-4">
      <div className="card bg-blanco-hueso w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <EoliaLogo
              className="h-24 sm:h-28 w-auto"
              fallbackClassName="text-6xl"
            />
          </div>
          <h1 className="font-fraunces text-3xl font-bold text-verde-musgo">
            Eolia
          </h1>
          <p className="text-tierra-oscura opacity-70 text-sm mt-1">
            Sistema de Gestión Agrícola
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tierra-oscura mb-2">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="usuario@eolia.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-tierra-oscura mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="input-field w-full"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs text-center font-medium">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-cta w-full justify-center"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-arena space-y-2 text-xs text-tierra-oscura opacity-60">
          <p>
            <span className="font-semibold">Ingeniero:</span>{" "}
            ingeniero@eolia.com
          </p>
          <p>
            <span className="font-semibold">Operario:</span> operario@eolia.com
          </p>
          <p>
            <span className="font-semibold">Contraseña:</span> eolia1234
          </p>
        </div>
      </div>
    </div>
  );
}
