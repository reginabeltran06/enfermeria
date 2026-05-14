// frontend/src/context/AuthContext.jsx
import React from "react";

const AuthContext = React.createContext({
  user: null,
  setUser: () => {},
  login: async () => false,
  logout: () => {},
  token: null,
});

export default AuthContext;
