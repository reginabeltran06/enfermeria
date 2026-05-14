// frontend/src/components/layout/MainLayout.jsx
import React, { useEffect, useState, useContext } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Notification from "../common/Notification";
import NotificationContext from "../../context/NotificationContext";
import AuthContext from "../../context/AuthContext";
import "./MainLayout.css";

function MainLayout({ children }) {
  const { notifications } = useContext(NotificationContext);
  const { token } = useContext(AuthContext);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/alerts/summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setAlertCount(data.summary.alertas_activas || 0);
        }
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    if (token) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 30000); // Actualizar cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="layout-container">
        <Navbar alertCount={alertCount} />
        <main className="main-content">
          <div className="content-wrapper">{children}</div>
        </main>
      </div>

      <div className="notifications-container">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            id={notification.id}
            message={notification.message}
            type={notification.type}
          />
        ))}
      </div>
    </div>
  );
}

export default MainLayout;
