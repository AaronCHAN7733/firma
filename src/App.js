// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import Home from './components/Home';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Ruta de Login */}
        <Route
          path="/login"
          element={user ? <Navigate to="/home" /> : <Login onLogin={setUser} />}
        />

        {/* Ruta de Home */}
        <Route
          path="/home"
          element={user ? <Home user={user} /> : <Navigate to="/login" />}
        />

        {/* Redireccionar a Login si la ruta no existe */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
