import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import NotificationContext from "../context/NotificationContext";
import "./StockControl.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function StockControl() {
  const { token } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);

  const [medicines, setMedicines] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const notify = (message, type = "info") => {
    if (typeof addNotification === "function") addNotification(message, type);
  };
  const selectedMedicine = medicines.find(
    (medicine) => medicine.id === selectedId,
  );

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/medicines?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.message || "Error al cargar medicamentos");
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error("Error cargando medicamentos:", error);
      notify(error.message || "Error al cargar medicamentos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const getEndpoint = () => {
    if (tipo === "entrada") return `${API_BASE_URL}/api/inventory/entry`;
    if (tipo === "salida") return `${API_BASE_URL}/api/inventory/exit`;
    return `${API_BASE_URL}/api/inventory/adjust`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedId) {
      notify("Selecciona un medicamento", "error");
      return;
    }

    if (!cantidad || Number(cantidad) < 0) {
      notify("Ingresa una cantidad válida", "error");
      return;
    }

    if (
      tipo === "salida" &&
      selectedMedicine &&
      Number(cantidad) > Number(selectedMedicine.stock_actual)
    ) {
      notify("Stock insuficiente para registrar la salida", "error");
      return;
    }

    try {
      setSaving(true);

      const payload =
        tipo === "ajuste"
          ? {
              medicamento_id: selectedId,
              nueva_cantidad: Number(cantidad),
              motivo: motivo || "ajuste",
            }
          : {
              medicamento_id: selectedId,
              cantidad: Number(cantidad),
              motivo: motivo || tipo,
            };

      const response = await fetch(getEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al registrar movimiento");
      }

      notify(data.message || "Movimiento registrado", "success");
      setCantidad("");
      setMotivo("");
      await fetchMedicines();
    } catch (error) {
      console.error("Error registrando movimiento:", error);
      notify(error.message || "Error al registrar movimiento", "error");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="stock-loading">
        <div className="spinner-large"></div>
        <p>Cargando control de stock...</p>
      </div>
    );
  }

  return (
    <div className="stock-page">
      <div className="stock-header">
        <h1>Control de Stock</h1>
        <p className="stock-subtitle">
          Registra entradas, salidas y ajustes de inventario
        </p>
      </div>

      <div className="stock-grid">
        <section className="stock-form-card animate-scale">
          <div className="section-header">
            <h2>Nuevo movimiento</h2>
            <p>Selecciona un medicamento y registra el movimiento.</p>
          </div>

          <form className="stock-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tipo de movimiento</label>
              <select
                className="form-input"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>

            <div className="form-group">
              <label>Medicamento</label>
              <select
                className="form-input"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">Selecciona un medicamento</option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{tipo === "ajuste" ? "Nueva cantidad" : "Cantidad"}</label>
              <input
                className="form-input"
                type="number"
                min="0"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Motivo</label>
              <textarea
                className="form-input textarea-input"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Motivo del movimiento"
              />
            </div>
            <button
              className="stock-primary-button"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner"></span>Guardando...
                </>
              ) : (
                "Registrar movimiento"
              )}
            </button>
          </form>
        </section>

        <section className="stock-info-card animate-scale">
          <div className="section-header">
            <h2>Medicamento seleccionado</h2>
            <p>Información actual de medicamento.</p>
          </div>

          {selectedMedicine ? (
            <div className="stock-info">
              <div className="stock-info-title">{selectedMedicine.nombre}</div>

              <div className="stock-info-grid">
                <div>
                  <span>Stock actual</span>
                  <strong>{selectedMedicine.stock_actual}</strong>
                </div>
                <div>
                  <span>Stock mínimo</span>
                  <strong>{selectedMedicine.stock_minimo}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Selecciona un medicamento para ver su stock.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default StockControl;
