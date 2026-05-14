// frontend/src/components/common/Notification.jsx
import React, { useContext, useEffect } from 'react';
import NotificationContext from '../../context/NotificationContext';
import './Notification.css';

function Notification({ id, message, type = 'info' }) {
  const { removeNotification } = useContext(NotificationContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, removeNotification]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`notification notification-${type} animate-slide-right`}>
      <span className="notification-icon">{icons[type]}</span>
      <span className="notification-message">{message}</span>
      <button
        className="notification-close"
        onClick={() => removeNotification(id)}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
}

export default Notification;
