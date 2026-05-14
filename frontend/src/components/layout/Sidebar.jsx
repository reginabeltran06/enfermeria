// frontend/src/components/layout/Sidebar.jsx
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import "./Sidebar.css";
import robleUP from "../../assets/roble-up.png";

const icons = {
  home: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <path
        d="M3 10.5L12 3l9 7.5V21h-6v-6H9v6H3v-10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  medicines: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <path
        d="M10 21h4M12 3v18M7 7h10a3 3 0 0 1 3 3v2H4v-2a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5 12h14v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  stock: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <path
        d="M4 7l8-4 8 4-8 4-8-4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4 7v10l8 4 8-4V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 11v10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <path
        d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4 4v4.5h4.5M12 8v5l3 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  alerts: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <path
        d="M12 3l10 18H2L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v5M12 17h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
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
  ),
};

function Sidebar() {
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { path: "/", label: "Inicio", icon: icons.home, exact: true },
    { path: "/medicamentos", label: "Medicamentos", icon: icons.medicines },
    { path: "/stock", label: "Stock", icon: icons.stock },
    { path: "/historial", label: "Historial", icon: icons.history },
    { path: "/alertas", label: "Alertas", icon: icons.alerts },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={robleUP} alt="Roble UP" className="up-logo" />

          <div className="logo-text">
            <div className="logo-title">Universidad</div>
            <div className="logo-title">Panamericana</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            end={item.exact}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout} title="Cerrar sesión">
          <span className="sidebar-icon">{icons.logout}</span>
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
