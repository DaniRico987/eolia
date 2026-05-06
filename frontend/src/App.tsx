import React, { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Operario from "./pages/Operario";
import Navbar from "./components/Navbar";
import type { Usuario } from "./types";

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  const handleLogin = (user: Usuario) => setUsuario(user);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  if (!usuario) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-crema flex flex-col">
      <Navbar usuario={usuario} onLogout={handleLogout} />
      <div className="flex-1">
        {usuario.rol === "ingeniero" ? (
          <Dashboard usuario={usuario} />
        ) : (
          <Operario />
        )}
      </div>
    </div>
  );
}
