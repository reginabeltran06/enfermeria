// frontend/src/components/layout/Navbar.jsx
import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import "./Navbar.css";
import robleUP from "../../assets/roble-up.png";

const logoutIcon = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <path
      d="M15 3h3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 17l5-5-5-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 12H3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

function Navbar({ alertCount = 0 }) {
  const { user, logout } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <img src={robleUP} alt="Roble UP" className="navbar-up-logo" />
          <h1 className="navbar-title">Inventario de Enfermería</h1>
        </div>

        <div className="navbar-right">
          <div className="navbar-divider"></div>

          <div className="navbar-user">
            <div className="user-info">
              <div className="user-name">{user?.nombre}</div>
              {/* <div className="user-role">
                {user?.rol === 'admin' ? 'Administrador' : 'Usuario'}
              </div> */}
            </div>
            <div className="user-avatar">{user?.nombre?.charAt(0)}</div>
          </div>

          <button
            className="mobile-logout-btn"
            // onClick={logout}
            title="Cerrar sesión"
          >
            {logoutIcon}{" "}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
