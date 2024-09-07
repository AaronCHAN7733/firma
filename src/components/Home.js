// src/components/Home.js
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/Home.css';

const Home = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login');
    });
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <h2>Mi Aplicación</h2>
        <ul>
          <li>
            <Link to="/home">Inicio</Link>
          </li>
          <li>
            <Link to="/firma">Ver Firma</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </li>
        </ul>
      </nav>
      <div className="welcome">
        <h1>Bienvenido, {user.email}</h1>
      </div>
    </div>
  );
};

export default Home;
