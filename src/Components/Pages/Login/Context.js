import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || null);
  const [userType, setUserType] = useState(localStorage.getItem('userType') || null);

  const login = (token, id, role, user_name, user_type = 'admin') => {
    setAuthToken(token);
    setUserId(id);
    setUserRole(role);
    setUserName(user_name);
    setUserType(user_type);

    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', id);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', user_name);
    localStorage.setItem('userType', user_type);
  };

  const logout = () => {
    setAuthToken(null);
    setUserId(null);
    setUserRole(null);
    setUserName(null);
    setUserType(null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
  };

  useEffect(() => {
    setAuthToken(localStorage.getItem('authToken'));
    setUserId(localStorage.getItem('userId'));
    setUserRole(localStorage.getItem('userRole'));
    setUserName(localStorage.getItem('userName'));
    setUserType(localStorage.getItem('userType'));
  }, []);

  return (
    <AuthContext.Provider value={{ 
      authToken, 
      userId, 
      userRole, 
      userName, 
      userType, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};