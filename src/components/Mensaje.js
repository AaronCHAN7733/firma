import React, { useState } from 'react';
import Navbar from './Navbar';
import TopBar from './TopBar';
import '../styles/Mensaje.css'; // Asegúrate de incluir los estilos proporcionados

function Mensaje({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <Navbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        <TopBar userName="Administrador" />

        <section className="content">
          {/* Título del formulario */}
          <h2>Enviar Correo</h2>

          {/* Formulario de Mensaje */}
          <div className="form-container">
            <div className="form-group">
              <label>Para:</label>
              <input type="text" className="form-input" />
            </div>
            <div className="form-group">
              <label>Asunto:</label>
              <input type="text" className="form-input" />
            </div>
            <div className="form-group">
              <label>Mensaje:</label>
              <textarea className="form-textarea"></textarea>
              <div className="icon-container">
                <i className="icon-paper"></i> {/* Aquí puedes agregar el ícono del mensaje */}
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-cancel">Cancelar</button>
              <button className="btn-submit">Enviar</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Mensaje;
