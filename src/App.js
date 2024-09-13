import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase'; // Asegúrate de importar `db` desde tu archivo de Firebase
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login';
import Home from './components/Home';
import AdminHome from './components/AdminHome';
import Usuarios from './components/Usuarios';  // Importamos el componente Usuarios
import Mensaje from './components/Mensaje';  // Importamos el componente Mensaje
import HomeOperativos from './components/HomeOperativos';  // Componente para el rol 'personal'
import LlenarRequisicion from './components/LlenarRequisicion';  // Componente de requisición
import HomeFirmante from './components/HomeFirmante';  // Componente para el rol 'firmante'
import FirmarRequisicion from './components/FirmarRequisicion'; // Componente para firmar requisición

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

        {/* Ruta para el componente Usuarios, solo para administradores */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        {/* Ruta para el componente Mensaje, solo para administradores */}
        <Route
          path="/mensaje"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
              <Mensaje />
            </ProtectedRoute>
          }
        />

        {/* Ruta para personal (rol 'personal') */}
        <Route
          path="/homeOperativos"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['personal']}>
              <HomeOperativos user={user} />
            </ProtectedRoute>
          }
        />

        {/* Ruta para el formulario de requisición, solo para 'personal' */}
        <Route
          path="/llenarRequisicion"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['personal']}>
              <LlenarRequisicion user={user} />
            </ProtectedRoute>
          }
        />

        {/* Ruta para firmante (rol 'firmante') */}
        <Route
          path="/homeFirmante"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['firmante']}>
              <HomeFirmante user={user} />
            </ProtectedRoute>
          }
        />

        {/* Ruta para firmar requisiciones, solo para firmantes */}
        <Route
          path="/firmarRequisicion"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['firmante']}>
              <FirmarRequisicion user={user} />
            </ProtectedRoute>
          }
        />

        {/* Redireccionar rutas no válidas */}
        <Route
          path="*"
          element={
            <Navigate to={user ? (role === 'admin' ? "/adminHome" : role === 'personal' ? "/homeOperativos" : role === 'firmante' ? "/homeFirmante" : "/home") : "/login"} />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
