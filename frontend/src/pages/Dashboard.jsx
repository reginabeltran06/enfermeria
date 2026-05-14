import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import NotificationContext from "../context/NotificationContext";
import DashboardCard from "../components/dashboard/DashboardCard";
import "./Dashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Dashboard() {
  const { token } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);

  const [summary, setSummary] = useState(null);
  const [alertsSummary, setAlertsSummary] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const notify = (message, type = "info") => {
    if (typeof addNotification === "function") {
      addNotification(message, type);
    }
  };
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const generateRes = await fetch(`${API_BASE_URL}/api/alerts/generate`, {
        method: "POST",
        headers: authHeaders,
      });

      const generateData = await generateRes.json();

      if (!generateRes.ok || !generateData.success) {
        throw new Error(generateData.message || "Error al generar alertas");
      }

      const [summaryRes, alertsSummaryRes, historyRes, alertsRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/inventory/summary`, {
            headers: authHeaders,
          }),
          fetch(`${API_BASE_URL}/api/alerts/summary`, { headers: authHeaders }),
          fetch(`${API_BASE_URL}/api/inventory/history?limit=5`, {
            headers: authHeaders,
          }),
          fetch(`${API_BASE_URL}/api/alerts`, { headers: authHeaders }),
        ]);

      const summaryData = await summaryRes.json();
      const alertsSummaryData = await alertsSummaryRes.json();
      const historyData = await historyRes.json();
      const alertsData = await alertsRes.json();

      if (!summaryRes.ok || !summaryData.success)
        throw new Error(summaryData.message || "Error al cargar resumen");
      if (!alertsSummaryRes.ok || !alertsSummaryData.success)
        throw new Error(
          alertsSummaryData.message || "Error al cargar resumen de alertas",
        );
      if (!historyRes.ok || !historyData.success)
        throw new Error(historyData.message || "Error al cargar historial");
      if (!alertsRes.ok || !alertsData.success)
        throw new Error(alertsData.message || "Error al cargar alertas");

      setSummary(summaryData.summary || {});
      setAlertsSummary(alertsSummaryData.summary || {});
      setRecentMovements(historyData.movements || []);
      setActiveAlerts((alertsData.alerts || []).slice(0, 5));
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      notify(error.message || "Error al cargar dashboard", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!token) return;
    fetchDashboardData();
  }, [token]);
  const formatDate = (value) => {
    if (!value) return "Sin fecha";

    const normalizedValue = value.endsWith("Z") ? value : `${value}Z`;
    const date = new Date(normalizedValue);

    return new Intl.DateTimeFormat("es-MX", {
      timeZone: "America/Mexico_City",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatAlertType = (tipo) => {
    if (tipo === "sin_stock") return "Sin stock";
    if (tipo === "bajo_stock") return "Bajo stock";
    return tipo || "Alerta";
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Inicio</h1>
        <p className="dashboard-subtitle">Resumen general del inventario</p>
      </div>

      <div className="stats-grid">
        <DashboardCard
          title="Total de Medicamentos"
          value={summary?.total_medicamentos || 0}
          icon="💊"
          color="primary"
          subtitle="registrados"
        />
        <DashboardCard
          title="Bajo Stock"
          value={summary?.bajo_stock || 0}
          icon="⚠️"
          color="warning"
          subtitle="requieren atención"
        />
        <DashboardCard
          title="Sin Stock"
          value={summary?.sin_stock || 0}
          icon="❌"
          color="error"
          subtitle="sin unidades"
        />
      </div>
      <div className="dashboard-grid">
        <section className="dashboard-section dashboard-list-section">
          <h2 className="section-title">Alertas activas</h2>

          <div className="stat-highlight">
            <div className="stat-number">
              {alertsSummary?.alertas_activas || 0}
            </div>
            <div className="stat-label">alertas pendientes</div>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="empty-state">No hay alertas activas.</div>
          ) : (
            <div className="dashboard-list">
              {activeAlerts.map((alert) => (
                <div className="dashboard-list-item" key={alert.id}>
                  <div>
                    <strong>
                      {alert.medicamento ||
                        alert.nombre_medicamento ||
                        "Medicamento"}
                    </strong>
                    <p>
                      {formatAlertType(alert.tipo)} ·{" "}
                      {alert.mensaje || "Revisar inventario"}
                    </p>
                  </div>
                  <span>{formatDate(alert.creado_en)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section dashboard-list-section">
          <h2 className="section-title">Actividad reciente</h2>

          {recentMovements.length === 0 ? (
            <div className="empty-state">No hay movimientos recientes.</div>
          ) : (
            <div className="dashboard-list">
              {recentMovements.map((movement) => (
                <div className="dashboard-list-item" key={movement.id}>
                  <div>
                    <strong>{movement.medicamento || "Medicamento"}</strong>
                    <p>
                      {movement.tipo} · {movement.cantidad} unidades
                    </p>
                  </div>
                  <span>{formatDate(movement.creado_en)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
