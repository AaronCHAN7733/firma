import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase'; // Asegúrate de importar `db` desde tu archivo de Firebase
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login';
import Home from './components/Home';
import AdminHome from './components/AdminHome';
import Usuarios from './components/Usuarios';  // Importamos el nuevo componente Usuarios

function ProtectedRoute({ user, role, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirige a una página de acceso denegado o la página por defecto para usuarios
    return <Navigate to="/home" />;
  }

  return children;
}

function App() {

  
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // Estado para almacenar el rol
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Si el usuario está autenticado, obtén el rol desde Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role); // Asigna el rol al estado
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Ruta de login */}
        <Route
          path="/login"
          element={<Login onLogin={(user, role) => { setUser(user); setRole(role); }} />}
        />

        {/* Ruta para usuarios normales */}
        <Route
          path="/home"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['user']}>
              <Home user={user} />
            </ProtectedRoute>
          }
        />

        {/* Ruta para administradores */}
        <Route
          path="/adminHome"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
              <AdminHome user={user} />
            </ProtectedRoute>
          }
        />

        {/* Nueva ruta para el componente Usuarios, solo para administradores */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        {/* Redireccionar rutas no válidas */}
        <Route path="*" element={<Navigate to={user ? (role === 'admin' ? "/adminHome" : "/home") : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
