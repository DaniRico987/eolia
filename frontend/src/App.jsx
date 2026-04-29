import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Operario from "./pages/Operario";
import Navbar from "./components/Navbar";
/** @typedef {import("./types").Usuario} Usuario */

export default function App() {
  const [usuario, setUsuario] = useState(/** @type {Usuario | null} */ (null));

  useEffect(() => {
    const guardado = localStorage.getItem("usuario");
    if (guardado) setUsuario(JSON.parse(guardado));
  }, []);

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
          <Operario usuario={usuario} />
        )}
      </div>
    </div>
  );
}
