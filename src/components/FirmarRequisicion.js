import React, { useState } from 'react';
import FirmanteNavbar from './FirmanteNavbar';  // Importamos el componente FirmanteNavbar
import TopBar from './TopBar';  // Importamos el nuevo componente TopBar

function FirmarRequisicion({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      {/* Usamos el componente FirmanteNavbar aquí */}
      <FirmanteNavbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        {/* Usamos el nuevo componente TopBar */}
        <TopBar userName="Firmante" />

        <section className="content">
        </section>
      </main>
    </div>
  );
}

export default FirmarRequisicion;
