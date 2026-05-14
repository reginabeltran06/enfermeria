import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import NotificationContext from "../context/NotificationContext";
import "./Medicines.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const initialFormData = {
  nombre: "",
  descripcion: "",
  stock_actual: 0,
  stock_minimo: 0,
};

function Medicines() {
  const { token } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const notify = (message, type = "info") => {
    if (typeof addNotification === "function") {
      addNotification(message, type);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: "1", limit: "100" });

      if (search.trim()) {
        params.append("buscar", search.trim());
      }

      const response = await fetch(
        `${API_BASE_URL}/api/medicines?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al obtener medicamentos");
      }
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error("Error obteniendo medicamentos:", error);
      notify(error.message || "Error al obtener medicamentos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchMedicines, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setSelectedMedicine(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      notify("El nombre del medicamento es requerido", "error");
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(selectedMedicine);
      const url = isEditing
        ? `${API_BASE_URL}/api/medicines/${selectedMedicine.id}`
        : `${API_BASE_URL}/api/medicines`;

      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        stock_minimo: Number(formData.stock_minimo),
      };

      if (!isEditing) {
        payload.stock_actual = Number(formData.stock_actual);
      }

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al guardar medicamento");
      }

      notify(
        isEditing ? "Medicamento actualizado" : "Medicamento creado",
        "success",
      );
      resetForm();
      fetchMedicines();
    } catch (error) {
      console.error("Error guardando medicamento:", error);
      notify(error.message || "Error al guardar medicamento", "error");
    } finally {
      setSaving(false);
    }
  };
  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      nombre: medicine.nombre || "",
      descripcion: medicine.descripcion || "",
      stock_actual: medicine.stock_actual ?? 0,
      stock_minimo: medicine.stock_minimo ?? 0,
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este medicamento?",
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/medicines/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al eliminar medicamento");
      }

      notify("Medicamento eliminado", "success");
      fetchMedicines();
    } catch (error) {
      console.error("Error eliminando medicamento:", error);
      notify(error.message || "Error al eliminar medicamento", "error");
    }
  };

  const getStockStatus = (medicine) => {
    if (Number(medicine.stock_actual) === 0) return "sin-stock";
    if (Number(medicine.stock_actual) < Number(medicine.stock_minimo))
      return "bajo-stock";
    return "disponible";
  };

  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter(
    (medicine) => Number(medicine.stock_actual) < Number(medicine.stock_minimo),
  ).length;
  const noStockCount = medicines.filter(
    (medicine) => Number(medicine.stock_actual) === 0,
  ).length;

  if (loading) {
    return (
      <div className="medicines-loading">
        <div className="spinner-large"></div>
        <p>Cargando medicamentos...</p>
      </div>
    );
  }

  return (
    <div className="medicines-page">
      <div className="medicines-header">
        <h1>Medicamentos</h1>
        <p className="medicines-subtitle">
          Administra los medicamentos disponibles o agrega uno nuevo
        </p>
      </div>

      <div className="medicines-content-grid">
        <section className="medicine-form-section animate-scale">
          <div className="section-header">
            <h2>
              {selectedMedicine ? "Editar medicamento" : "Nuevo medicamento"}
            </h2>
            <p>
              {selectedMedicine
                ? "Actualiza la información general"
                : "Agrega un nuevo medicamento"}
            </p>
          </div>

          <form className="medicine-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="form-input textarea-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock_actual">Stock actual</label>
                <input
                  id="stock_actual"
                  name="stock_actual"
                  type="number"
                  min="0"
                  value={formData.stock_actual}
                  onChange={handleChange}
                  className="form-input"
                  disabled={Boolean(selectedMedicine)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock_minimo">Stock mínimo</label>
                <input
                  id="stock_minimo"
                  name="stock_minimo"
                  type="number"
                  min="0"
                  value={formData.stock_minimo}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="medicine-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner"></span>Guardando...
                  </>
                ) : selectedMedicine ? (
                  "Actualizar"
                ) : (
                  "Guardar"
                )}
              </button>
              {selectedMedicine && (
                <button
                  type="button"
                  className="medicine-secondary-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="medicines-list-section animate-scale">
          <div className="section-header list-header">
            <div>
              <h2>Inventario</h2>
              <p>{medicines.length} medicamentos encontrados</p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar medicamento..."
              className="medicine-search-input"
            />
          </div>

          {medicines.length === 0 ? (
            <div className="empty-state">No hay medicamentos registrados.</div>
          ) : (
            <div className="medicines-table-wrapper">
              <table className="medicines-table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Stock</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td>
                        <div className="medicine-name-cell">
                          <div>
                            <strong>{medicine.nombre}</strong>
                            <span>
                              {medicine.presentacion || "Sin presentación"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`stock-badge ${getStockStatus(medicine)}`}
                        >
                          {medicine.stock_actual}
                        </span>
                      </td>
                      <td>{medicine.descripcion || " - "}</td>
                      <td>
                        <div className="medicine-actions">
                          <button
                            className="medicine-edit-button"
                            onClick={() => handleEdit(medicine)}
                          >
                            Editar
                          </button>
                          <button
                            className="medicine-delete-button"
                            onClick={() => handleDelete(medicine.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Medicines;
