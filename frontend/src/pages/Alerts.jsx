// frontend/src/pages/Alerts.jsx
import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import NotificationContext from "../context/NotificationContext";
import "./Alerts.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Alerts() {
  const { token } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const notify = (message, type = "info") => {
    if (typeof addNotification === "function") addNotification(message, type);
  };

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/medicines?limit=100`, {
        headers: authHeaders,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al obtener medicamentos");
      }

      const medicines = data.medicines || [];

      const generatedAlerts = medicines
        .filter(
          (medicine) =>
            Number(medicine.stock_actual) < Number(medicine.stock_minimo),
        )
        .map((medicine) => {
          const isNoStock = Number(medicine.stock_actual) === 0;

          return {
            id: medicine.id,
            medicamento: medicine.nombre,
            stock_actual: medicine.stock_actual,
            stock_minimo: medicine.stock_minimo,
            tipo: isNoStock ? "sin_stock" : "bajo_stock",
            mensaje: isNoStock
              ? `${medicine.nombre} está sin stock`
              : `${medicine.nombre} tiene stock bajo (${medicine.stock_actual} unidades, mínimo: ${medicine.stock_minimo})`,
          };
        });

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error("Error obteniendo alertas:", error);
      notify(error.message || "Error al obtener alertas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (!filter) return true;
    return alert.tipo === filter;
  });

  const lowStockCount = alerts.filter(
    (alert) => alert.tipo === "bajo_stock",
  ).length;
  const noStockCount = alerts.filter(
    (alert) => alert.tipo === "sin_stock",
  ).length;

  if (loading) {
    return (
      <div className="alerts-loading">
        <div className="spinner-large"></div>
        <p>Cargando alertas...</p>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <div>
          <h1>Alertas</h1>
          <p className="alerts-subtitle">
            Monitorea medicamentos que requieren atención
          </p>
        </div>
      </div>

      <div className="alerts-stats-grid">
        <div className="alert-stat-card warning">
          <div className="alert-stat-value">{lowStockCount}</div>
          <div className="alert-stat-label">Bajo stock</div>
        </div>

        <div className="alert-stat-card error">
          <div className="alert-stat-value">{noStockCount}</div>
          <div className="alert-stat-label">Sin stock</div>
        </div>
      </div>

      <section className="alerts-filter-card animate-scale">
        <div className="form-group">
          <label>Filtrar alertas</label>
          <select
            className="form-input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="bajo_stock">Bajo stock</option>
            <option value="sin_stock">Sin stock</option>
          </select>
        </div>
      </section>

      <section className="alerts-list-card animate-scale">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">No hay alertas para este filtro.</div>
        ) : (
          <div className="alerts-page-list">
            {filteredAlerts.map((alert) => (
              <div
                className={`alert-row ${
                  alert.tipo === "sin_stock" ? "sin-stock" : "bajo-stock"
                }`}
                key={alert.id}
              >
                <div className="alert-row-icon">
                  {alert.tipo === "sin_stock" ? "❌" : "⚠️"}
                </div>

                <div className="alert-row-content">
                  <strong>{alert.medicamento || "Medicamento"}</strong>
                  <p>{alert.mensaje}</p>
                </div>

                <span className="alert-status-badge">
                  {alert.tipo === "sin_stock" ? "Sin stock" : "Bajo stock"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Alerts;
