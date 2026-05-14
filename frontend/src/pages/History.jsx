import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import NotificationContext from "../context/NotificationContext";
import "./History.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function History() {
  const { token } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);

  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState("");

  const notify = (message, type = "info") => {
    if (typeof addNotification === "function") addNotification(message, type);
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "100" });
      if (tipo) params.append("tipo", tipo);

      const response = await fetch(
        `${API_BASE_URL}/api/inventory/history?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.message || "Error al obtener historial");

      setMovements(data.movements || []);
    } catch (error) {
      console.error("Error obteniendo historial:", error);
      notify(error.message || "Error al obtener historial", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [tipo]);

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

  if (loading) {
    return (
      <div className="history-loading">
        <div className="spinner-large"></div>
        <p>Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Historial</h1>
        <p className="history-subtitle">
          Consulta los movimientos registrados en el inventario
        </p>
      </div>

      <section className="history-filter-card animate-scale">
        <div className="form-group">
          <label>Filtrar por tipo</label>
          <select
            className="form-input"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
            <option value="ajuste">Ajuste</option>
          </select>
        </div>
      </section>
      <section className="history-table-card animate-scale">
        {movements.length === 0 ? (
          <div className="empty-state">No hay movimientos registrados.</div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Motivo</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.medicamento || "N/A"}</td>
                    <td>
                      <span className={`movement-badge ${movement.tipo}`}>
                        {movement.tipo}
                      </span>
                    </td>
                    <td>{movement.cantidad}</td>
                    <td>{movement.motivo || "Sin motivo"}</td>
                    <td>{movement.usuario || "N/A"}</td>
                    <td>{formatDate(movement.creado_en)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default History;
