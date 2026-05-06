import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Operario from "./pages/Operario";
import Navbar from "./components/Navbar";
/** @typedef {import("./types").Usuario} Usuario */

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  /** @param {Usuario} user */
  const handleLogin = (user) => setUsuario(user);

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
