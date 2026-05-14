// frontend/src/context/NotificationContext.jsx
import React from "react";

const NotificationContext = React.createContext({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

export default NotificationContext;
