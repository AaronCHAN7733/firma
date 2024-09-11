import React from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Asegúrate de importar correctamente el objeto auth

function Home({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirigir al login después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
    }
  };

  return (
    <div>
      <h1>Bienvenido, {user.email}</h1>
      <p>Este es tu inicio, aquí puedes acceder a tus funcionalidades.</p>
      <button onClick={handleLogout}>Cerrar sesión</button> {/* Botón para cerrar sesión */}
    </div>
  );
}

export default Home;
