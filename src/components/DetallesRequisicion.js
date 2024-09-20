import React, { useState } from 'react';
import '../styles/DetallesRequisicion.css';
import { useLocation } from 'react-router-dom'; 
import { getAuth } from 'firebase/auth'; 
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { db } from '../firebase';
import Swal from 'sweetalert';

function DetallesRequisicion() {
  const location = useLocation();
  const { requisicion } = location.state || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [firma, setFirma] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [firmaExistente, setFirmaExistente] = useState(null);

  const auth = getAuth();
  const usuario = auth.currentUser;

  // Función para calcular el total de la requisición
  const calcularTotal = () => {
    if (!requisicion.items) return 0;
    return requisicion.items.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0);
  };

  // Convertir la firma en hash usando crypto.subtle
  const generarHashFirma = async (firma) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(firma);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  // Obtener la firma existente del usuario desde Firestore
  const obtenerFirmaExistente = async () => {
    const firmaRef = doc(db, 'firmas', usuario.uid);
    const firmaSnap = await getDoc(firmaRef);
    if (firmaSnap.exists()) {
      setFirmaExistente(firmaSnap.data().firma); // Firma hash existente
    }
  };

  // Al abrir el modal, cargamos la firma existente si existe
  const abrirModal = async () => {
    setModalVisible(true);
    await obtenerFirmaExistente();
  };

  // Función para firmar y guardar la firma en Firestore encriptada
  const firmarRequisicion = async () => {
    if (firma.length !== 5 || isNaN(firma)) {
      setMensajeError('La firma debe ser un número de 5 dígitos');
      return;
    }

    const firmaHash = await generarHashFirma(firma);

    if (firmaExistente) {
      // Validar firma existente
      if (firmaHash !== firmaExistente) {
        setMensajeError('La firma no es válida o no coincide');
        return;
      }
      Swal({
        title: "¡Éxito!",
        text: "Firma Valida.",
        icon: "success",
        button: "OK"
      });
    } else {
      // Guardar nueva firma en Firestore
      await setDoc(doc(db, 'firmas', usuario.uid), {
        firma: firmaHash,
      });
      Swal({
        title: "¡Éxito!",
        text: "Firma Creada Exitosamente.",
        icon: "success",
        button: "OK"
      });
    }

    setModalVisible(false);
    setMensajeError('');
    setFirma('');
  };

  if (!requisicion) {
    return <p>No hay detalles para mostrar</p>;
  }

  return (
    <div className="detalles-requisicion-container">
      <h3 className="detalles-requisicion-header">Detalles de la Requisición</h3>
      {/* Mostrar detalles de la requisición */}
      <div className="detalles-requisicion-content">
        <div><strong>Usuario que realizó la Requisición:</strong> {requisicion.nombreUsuario}</div>
        <div><strong>Área solicitante:</strong> {requisicion.areaSolicitante}</div>
        <div><strong>Componente:</strong> {requisicion.componente}</div>
        <div><strong>Concepto:</strong> {requisicion.concepto}</div>
        <div><strong>Dirección de Adscripción:</strong> {requisicion.direccionAdscripcion}</div>
        <div><strong>Estatus:</strong> {requisicion.estatus}</div>
        <div><strong>Fecha de Elaboración:</strong> {requisicion.fechaElaboracion}</div>
        <div><strong>Fecha del Evento:</strong> {requisicion.fechaEvento}</div>
        <div><strong>Folio:</strong> {requisicion.folio}</div>
        <div><strong>Nombre del Evento:</strong> {requisicion.nombreEvento}</div>
      </div>

      <h4>Materiales/Servicios</h4>
      <table className="detalles-requisicion-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Precio Unitario</th>
            <th>Concepto</th>
            <th>Partida</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {requisicion.items && requisicion.items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.cantidad}</td>
              <td>{item.unidad}</td>
              <td>{item.precioUnitario}</td>
              <td>{item.concepto}</td>
              <td>{item.partida}</td>
              <td>{item.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="total-section-firmante">
        <strong>Total: </strong> {calcularTotal().toFixed(2)}
      </div>

      {/* Botón para firmar */}
      <button className="firmar-button" onClick={abrirModal}>
        Firmar
      </button>

      {/* Modal de firma */}
      {modalVisible && (
        <div className="modal-firma">
          <div className="modal-content-firma">
            <h4>{firmaExistente ? 'Validar Firma' : 'Crear Firma'}</h4>
            <input 
              type="text" 
              placeholder="Ingrese su firma (5 dígitos)" 
              value={firma} 
              onChange={(e) => setFirma(e.target.value)} 
              maxLength={5}
            />
            {mensajeError && <p className="error-message">{mensajeError}</p>}
            <button onClick={firmarRequisicion}>
              {firmaExistente ? 'Validar Firma' : 'Guardar Firma'}
            </button>
            <button onClick={() => setModalVisible(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetallesRequisicion;
