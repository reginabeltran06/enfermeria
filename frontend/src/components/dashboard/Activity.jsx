// frontend/src/components/dashboard/RecentActivity.jsx
import React, { useState, useEffect } from "react";
import "./Activity.css";

function RecentActivity({ token }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/history?limit=5",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setActivities(data.movements || []);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, [token]);

  const getTypeIcon = (type) => {
    switch (type) {
      case "entrada":
        return "📥";
      case "salida":
        return "📤";
      case "ajuste":
        return "⚙️";
      default:
        return "📋";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "entrada":
        return "Entrada";
      case "salida":
        return "Salida";
      case "ajuste":
        return "Ajuste";
      default:
        return "Movimiento";
    }
  };

  return (
    <div className="activity-panel">
      <h2 className="panel-title">📋 Actividad Reciente</h2>
      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="empty-state">Sin movimientos recientes</div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">{getTypeIcon(activity.tipo)}</div>
              <div className="activity-details">
                <div className="activity-main">
                  <span className="activity-medicine">
                    {activity.medicamento}
                  </span>
                  <span className="activity-type">
                    {getTypeLabel(activity.tipo)}
                  </span>
                </div>
                <div className="activity-meta">
                  <span className="activity-user">👤 {activity.usuario}</span>
                  <span className="activity-time">
                    {new Date(activity.fecha).toLocaleString("es-MX")}
                  </span>
                </div>
              </div>
              <div className="activity-quantity">
                <span
                  className={
                    activity.tipo === "entrada" ? "positive" : "negative"
                  }
                >
                  {activity.tipo === "entrada" ? "+" : "-"}
                  {activity.cantidad}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// frontend/src/components/dashboard/AlertsPanel.jsx
function AlertsPanel({ token }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/alerts?limit=5",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts || []);
        }
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    fetchAlerts();
  }, [token]);

  const getAlertIcon = (type) => {
    switch (type) {
      case "bajo_stock":
        return "📉";
      case "proximo_vencimiento":
        return "⏰";
      case "vencido":
        return "❌";
      default:
        return "⚠️";
    }
  };

  return (
    <div className="alerts-panel">
      <h2 className="panel-title">⚠️ Alertas Activas</h2>
      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="empty-state">✓ No hay alertas activas</div>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} className={`alert-item alert-${alert.tipo}`}>
              <div className="alert-icon">{getAlertIcon(alert.tipo)}</div>
              <div className="alert-content">
                <div className="alert-title">{alert.medicamento}</div>
                <div className="alert-message">{alert.mensaje}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export { RecentActivity, AlertsPanel };
