// src/components/TopBar.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import '../styles/AdminHome.css'; // Crear un archivo de estilo para el componente si es necesario

function TopBar({ userName }) {
  return (
    <header className="top-bar">
      <div className="right-content">
        <div className="icons">
          <button className="notification-icon">
            <FontAwesomeIcon icon={faBell} />
          </button>
          <button className="message-icon">
            <FontAwesomeIcon icon={faEnvelope} />
          </button>
        </div>
        <div className="user-info">
          <span>{`Hola ${userName}`}</span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
