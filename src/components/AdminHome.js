import React, { useState } from 'react';
import Navbar from './Navbar';  // Importamos el componente Navbar
import TopBar from './TopBar';  // Importamos el nuevo componente TopBar
import '../styles/AdminHome.css';

function AdminHome({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      {/* Usamos el componente Navbar aquí */}
      <Navbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        {/* Usamos el nuevo componente TopBar */}
        <TopBar userName="Administrador" />

        <section className="content">
          <p>Aquí va el contenido principal para el administrador.</p>
        </section>
      </main>
    </div>
  );
}

export default AdminHome;
