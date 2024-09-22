import React, { useState, useEffect } from 'react';
import '../../styles/DetallesRequisicion.css';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { getAuth } from 'firebase/auth'; 
import { doc, getDoc, setDoc, collection } from 'firebase/firestore'; 
import { db } from '../../firebase';
import Swal from 'sweetalert';

function DetallesRequisicion() {
  const location = useLocation();
  const { requisicion } = location.state || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [firma, setFirma] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [firmaExistente, setFirmaExistente] = useState(null);
  const [codigoFirma, setCodigoFirma] = useState('');
  const [firmaValidada, setFirmaValidada] = useState(false);
  const [requisicionFirmada, setRequisicionFirmada] = useState(false); 
  const [cargando, setCargando] = useState(true); // Nuevo estado de carga

  const auth = getAuth();
  const usuario = auth.currentUser;
  const navigate = useNavigate(); 

  const calcularTotal = () => {
    if (!requisicion.items) return 0;
    return requisicion.items.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0);
  };

  const generarCodigoFirma = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const generarHashFirma = async (firma) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(firma + usuario.uid); 
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const obtenerFirmaExistente = async () => {
    const firmaRef = doc(db, 'firmas', usuario.uid);
    const firmaSnap = await getDoc(firmaRef);
    if (firmaSnap.exists()) {
      setFirmaExistente(firmaSnap.data()); 
    }
  };

  const verificarRequisicionFirmada = async () => {
    const flujoDeFirmasRef = doc(db, 'FlujoDeFirmas', requisicion.id);
    const flujoSnap = await getDoc(flujoDeFirmasRef);
    if (flujoSnap.exists()) {
      setRequisicionFirmada(true); 
    }
    setCargando(false); // Cuando termina la verificación, dejamos de cargar
  };

  const abrirModal = async () => {
    setModalVisible(true);
    await obtenerFirmaExistente();
  };

  const firmarRequisicion = async () => {
    if (firma.length !== 5 || isNaN(firma)) {
      setMensajeError('La firma debe ser un número de 5 dígitos');
      return;
    }

    const firmaHash = await generarHashFirma(firma);

    if (firmaExistente) {
      if (firmaHash !== firmaExistente.firma) {
        setMensajeError('La firma no es válida o no coincide');
        return;
      }
      Swal({
        title: "¡Éxito!",
        text: "Firma válida.",
        icon: "success",
        button: "OK"
      });
      setCodigoFirma(firmaExistente.codigo); 
    } else {
      const nuevoCodigoFirma = generarCodigoFirma(); 
      await setDoc(doc(db, 'firmas', usuario.uid), {
        firma: firmaHash,
        codigo: nuevoCodigoFirma, 
      });
      Swal({
        title: "¡Éxito!",
        text: "Firma creada exitosamente. Código de firma: " + nuevoCodigoFirma,
        icon: "success",
        button: "OK"
      });
      setCodigoFirma(nuevoCodigoFirma); 
    }

    setFirmaValidada(true);
    setModalVisible(false);
    setMensajeError('');
    setFirma('');
  };

  const enviarFirma = async () => {
    const flujoDeFirmasRef = doc(collection(db, 'FlujoDeFirmas'), requisicion.id);
    await setDoc(flujoDeFirmasRef, {
      codigoFirma: codigoFirma,
      requisicionId: requisicion.id,
      // Remover usuarioId y fechaFirma
    });
  
    Swal({
      title: "¡Firma enviada!",
      text: "El código de firma y la requisición han sido registrados.",
      icon: "success",
      button: "OK"
    });
  
    setFirmaValidada(false);
    navigate(-1);
  };
  

  useEffect(() => {
    if (requisicion) {
      verificarRequisicionFirmada();
    }
  }, [requisicion]);

  if (!requisicion) {
    return <p>No hay detalles para mostrar</p>;
  }

  return (
    <div className="detalles-requisicion-container">
      <h3 className="detalles-requisicion-header">Detalles de la Requisición</h3>
      <div className="detalles-requisicion-content">
        {/* Mostrar detalles de la requisición */}
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

      {/* Mostrar si la requisición ya está firmada */}
      {cargando ? (
        <p>Cargando...</p>  // Mostrar mensaje de carga
      ) : requisicionFirmada ? (
        <div className="requisicion-firmada">
          <p>Requisición firmada verifica el estatus de tu Requisición</p>
        </div>
      ) : (
        <>
          {/* Mostrar código de firma si ha sido validada */}
          {firmaValidada && (
            <div className="codigo-firma-section">
              <p><strong>Código de Firma:</strong> {codigoFirma}</p>
              <button onClick={enviarFirma}>Enviar Firma</button>
            </div>
          )}

          {/* Botón para firmar solo si no ha sido validada la firma */}
          {!firmaValidada && (
            <button className="firmar-button" onClick={abrirModal}>
              Firmar
            </button>
          )}
        </>
      )}

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
            />
            {mensajeError && <p className="error-message">{mensajeError}</p>}
            <button onClick={firmarRequisicion}>Confirmar Firma</button>
            <button onClick={() => setModalVisible(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetallesRequisicion;
