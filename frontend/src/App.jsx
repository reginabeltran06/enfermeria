// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import NotificationContext from './context/NotificationContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import StockControl from './pages/StockControl';
import History from './pages/History';
import Alerts from './pages/Alerts';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.usuario);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, contraseña: password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en login');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.usuario);
      addNotification('✓ Bienvenido', 'success');
      return true;
    } catch (error) {
      addNotification(error.message, 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    addNotification('Sesión cerrada', 'info');
  };

  const addNotification = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);

    if (duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-bg)'
      }}>
        <div style={{
          fontSize: '24px',
          color: 'var(--color-primary)',
          fontWeight: 'bold'
        }}>
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, token }}>
      <NotificationContext.Provider value={{ 
        notifications, 
        addNotification, 
        removeNotification 
      }}>
        <BrowserRouter>
          {/* {!token ? (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          ) : (
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/medicamentos" element={<Medicines />} />
                <Route path="/stock" element={<StockControl />} />
                <Route path="/historial" element={<History />} />    
                <Route path="/alertas" element={<Alerts />} />
              </Routes>
            </MainLayout> */}
            
          {/* )} */}

          {/* * sin login * */}
           <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/medicamentos" element={<Medicines />} />
              <Route path="/stock" element={<StockControl />} />
                <Route path="/historial" element={<History />} />    
                <Route path="/alertas" element={<Alerts />} />            
                </Routes>
          </MainLayout> *


        </BrowserRouter>
      </NotificationContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
