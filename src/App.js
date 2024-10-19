import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase'; // Asegúrate de importar `db` desde tu archivo de Firebase
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login';
import Spinner from './components/Spinner';
import AdminHome from './components/ComponentsAdmin/AdminHome';
import Usuarios from './components/ComponentsAdmin/Usuarios';  // Importamos el componente Usuarios
import HomeOperativos from './components/HomeOperativos';  // Componente para el rol 'personal'
import LlenarRequisicion from './components/LlenarRequisicion';  // Componente de requisición
import Datos from './components/ComponentsAdmin/Datos';
import Areas from './components/ComponentsAdmin/Areas';
import Direcciones from './components/ComponentsAdmin/Direcciones';
import Partidas from './components/ComponentsAdmin/Partidas';
import Componentes from './components/ComponentsAdmin/Componentes';
import Organigrama from './components/ComponentsAdmin/Organigrama'; 
import LlenarRequisiciones from './components/ComponentsAdmin/LlenarRequisiciones';
import FirmarRequisicion from './components/componentsSolicitante/FirmarRequisicion';
import DetallesRequisicion from './components/componentsSolicitante/DetallesRequisicion';
import HomeFirmante from './components/componentsSolicitante/HomeFirmante';
import HistorialRequisiciones from './components/HistorialRequisciones';
import LlenarNuevaRequisicion from './components/componentsSolicitante/LlenarNuevaRequisicion';
import Firmas from './components/ComponentsAdmin/Firmas';
import HomeAutorizante from './components/componentsAutorizante/HomeAutorizante'
import FirmarRequisicionAutorizante from './components/componentsAutorizante/FirmarRequisicionAutorizante';
import AutorizarRequisicion from './components/componentsAutorizante/AutorizarRequisicion'; 
import Autorizar from './components/componentsAutorizante/Autorizar';
import Firmasrequisicion from './components/ComponentsAdmin/Firmasrequisicion';
import FirmarAdmin from './components/ComponentsAdmin/FirmarAdmin';
import AutorizarAdmin from './components/ComponentsAdmin/AutorizarAdmin';
import FirmarAutorizarAdmin from './components/ComponentsAdmin/FirmarAutorizarAdmin';
import LlenarRequisicionAutorizante from './components/componentsAutorizante/LlenarRequisicionAutorizante';
import EditarRequisiciones from './components/EditarRequisiciones';

function ProtectedRoute({ user, role, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirige a una página de acceso denegado o la página por defecto para usuarios
    return ;
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
    return <Spinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Ruta de login */}
        <Route
          path="/login"
          element={<Login onLogin={(user, role) => { setUser(user); setRole(role); }} />}
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

          <Route
            path="/datos"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <Datos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/firmas"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <Firmas />
              </ProtectedRoute>
            }
          />
          {/* Ruta para el componente Areas, solo para administradores */}
          <Route
            path="/areas"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <Areas />
              </ProtectedRoute>
            }
          />
            {/* Ruta para el componente LlenarRequisiciones, solo para administradores */}
            <Route
            path="/llenarRequisicion-admin"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <LlenarRequisiciones user={user} />
              </ProtectedRoute>
            }
          />

          {/* Ruta para el componente Direcciones, solo para administradores */}
          <Route
            path="/direcciones"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <Direcciones />
              </ProtectedRoute>
            }
          />

          {/* Ruta para el componente Partidas, solo para administradores */}
          <Route
            path="/partidas"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <Partidas />
              </ProtectedRoute>
            }
          />

          {/* Ruta para el componente Componentes, solo para administradores */}
          <Route
            path="/componentes"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <Componentes />
              </ProtectedRoute>
            }
          />

          {/* Ruta para el componente Organigrama, solo para administradores */}
          <Route
            path="/organigrama"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <Organigrama />
              </ProtectedRoute>
            }
          />
           <Route
            path="/firmar-requisiciones"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <Firmasrequisicion user={user}/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/firmar-admin"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <FirmarAdmin user={user}/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/AutorizarRequisicion-admin"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <AutorizarAdmin user={user}/>
              </ProtectedRoute>
            }
          />
           <Route
            path="/AutorizarRequisicion-admin-firmar"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <FirmarAutorizarAdmin user={user}/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/editar-requisicion"
            element={
              <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
                <EditarRequisiciones user={user}/>
              </ProtectedRoute>
            }
          />



        {/* Ruta para personal (rol 'personal') */}
        <Route
          path="/homeOperativos"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['secretario']}>
              <HomeOperativos user={user} />
            </ProtectedRoute>
          }
        />

        {/* Ruta para el formulario de requisición, solo para 'personal' */}
        <Route
          path="/llenarRequisicion"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['secretario']}>
              <LlenarRequisicion user={user} />
            </ProtectedRoute>
          }
        />

        {/* Ruta para historial, solo para 'personal' */}
        <Route
          path="/historial"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['secretario']}>
              <HistorialRequisiciones user={user} />
            </ProtectedRoute>
          }
        />

        {/* Ruta para firmante (rol 'firmante') */}
        <Route
          path="/homeFirmante"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['solicitante']}>
              <HomeFirmante user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/llenarRequisicion-solicitante"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['solicitante']}>
              <LlenarNuevaRequisicion />
            </ProtectedRoute>
          }
        />

        {/* Ruta para firmar requisiciones, solo para firmantes */}
        <Route
          path="/Seguimiento-Requisicion"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['solicitante']}>
              <FirmarRequisicion user={user} />
            </ProtectedRoute>
          }
        />

        {/* Ruta para ver detalles y firmar una requisición, solo para firmantes */}
        <Route
          path="/firmar"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['solicitante']}>
              <DetallesRequisicion />
            </ProtectedRoute>
          }
        />
         <Route
          path="/homeAutorizante"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['autorizante']}>
              <HomeAutorizante />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seguimiento-Requisiciones"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['autorizante']}>
              <FirmarRequisicionAutorizante user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AutorizarRequisicion"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['autorizante']}>
              <AutorizarRequisicion user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Autorizar"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['autorizante']}>
              <Autorizar user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/llenarRequisicionAutorizante"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={['autorizante']}>
              <LlenarRequisicionAutorizante user={user} />
            </ProtectedRoute>
          }
        />
        
        

        {/* Redireccionar rutas no válidas */}
        <Route
            path="*"
            element={
              <Navigate to={
                user ? (
                  role === 'admin' ? "/adminHome" : 
                  role === 'secretario' ? "/homeOperativos" : 
                  role === 'solicitante' ? "/homeFirmante" : 
                  role === 'autorizante' ? "/homeAutorizante" : 
                  "/login" // Si el rol no coincide con ninguno, los manda a login
                ) : "/login"
              } />
            }
          />

      </Routes>
    </Router>
  );
}

export default App;
