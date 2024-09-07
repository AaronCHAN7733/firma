// src/components/Home.js
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/Home.css';  // Importar el archivo CSS

const Home = ({ user }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="home-container">
      <h1>Bienvenido, {user.email}</h1>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Home;
