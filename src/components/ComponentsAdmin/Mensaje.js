import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import TopBar from './TopBar';
import { db } from '../firebase'; // Firebase ya configurado
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'; // Importar las funciones de Firestore
import '../../styles/Mensaje.css'; // Estilos

function Mensaje({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  // Función para enviar un mensaje a Firestore
  const sendMessage = async () => {
    if (!user || !user.email) {
      alert("El usuario no está autenticado o no tiene correo.");
      return;
    }

    if (!recipientEmail || !subject || !messageText) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      await addDoc(collection(db, 'messages'), {
        to: recipientEmail,
        from: user.email, // El correo del remitente
        subject: subject,
        messageText: messageText,
        timestamp: new Date()
      });
      alert('Mensaje enviado');
      // Limpiar campos después de enviar el mensaje
      setRecipientEmail('');
      setSubject('');
      setMessageText('');
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      alert('Hubo un problema al enviar el mensaje. Revisa la consola para más detalles.');
    }
  };

  // Recuperar mensajes que fueron enviados al usuario actual
  useEffect(() => {
    const getMessages = async () => {
      if (user && user.email) {
        try {
          const q = query(collection(db, 'messages'), where('to', '==', user.email)); // Filtrar por el correo del usuario
          const querySnapshot = await getDocs(q);
          const fetchedMessages = querySnapshot.docs.map(doc => doc.data());
          setMessages(fetchedMessages);
        } catch (error) {
          console.error('Error al recuperar los mensajes:', error);
        }
      }
    };

    if (user) {
      getMessages();
    }
  }, [user]);

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <Navbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        <TopBar userName="Administrador" />

        <section className="content">
          <h2>Enviar Correo</h2>

          <div className="form-container">
            <div className="form-group">
              <label>Para:</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="form-input"
                placeholder="Correo del destinatario"
              />
            </div>
            <div className="form-group">
              <label>Asunto:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-input"
                placeholder="Asunto"
              />
            </div>
            <div className="form-group">
              <label>Mensaje:</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="form-textarea"
                placeholder="Escribe tu mensaje aquí"
              ></textarea>
            </div>
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => {
                setRecipientEmail('');
                setSubject('');
                setMessageText('');
              }}>
                Cancelar
              </button>
              <button className="btn-submit" onClick={sendMessage}>
                Enviar
              </button>
            </div>
          </div>

          <section>
            <h3>Mensajes Recibidos</h3>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>
                  <strong>De:</strong> {msg.from} <br />
                  <strong>Asunto:</strong> {msg.subject} <br />
                  <strong>Mensaje:</strong> {msg.messageText} <br />
                  <strong>Fecha:</strong> {new Date(msg.timestamp.seconds * 1000).toLocaleString()}
                </li>
              ))}
            </ul>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Mensaje;
