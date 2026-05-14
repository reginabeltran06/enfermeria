// frontend/src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./Login.css";
import robleUP from "../assets/roble-up.png";

function Login() {
  const [email, setEmail] = useState("admin@enfermeria.up.edu");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/");
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setEmail("admin@enfermeria.up.edu");
    setPassword("Admin123!");
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>

      <div className="login-content">
        <div className="login-card animate-scale">
          <div className="login-header">
            <h1>Sistema de Inventario</h1>
            <p>Enfermería</p>
            <img src={robleUP} alt="Roble UP" className="login-up-logo" />
            <div className="university-name">Universidad Panamericana</div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error animate-slide-down">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@enfermeria.up.edu"
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="login-button">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Autenticando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>

            <div className="login-divider">o</div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="demo-button"
            >
              Demo Admin
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>- Universidad Panamericana -</p>
          <p>Campus Guadalajara </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
