import React, { useState, useEffect } from 'react';
import '../../styles/DetallesRequisicion.css';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { getAuth } from 'firebase/auth'; 
import { doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc } from 'firebase/firestore'; 
import { db } from '../../firebase';
import Swal from 'sweetalert2';

function DetallesRequisicion() {
  const location = useLocation();
  const { requisicion } = location.state || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [firma, setFirma] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [firmaExistente, setFirmaExistente] = useState(null);
  const [codigoFirma, setCodigoFirma] = useState('');
  const [firmaValidada, setFirmaValidada] = useState(false);
  const [estadoFirma, setEstadoFirma] = useState(null); 
  const [cargandoRequisicion, setCargandoRequisicion] = useState(true); // Nueva variable de estado para carga de requisición
  const [requisicionFirmada, setRequisicionFirmada] = useState(false);

  const auth = getAuth();
  const usuario = auth.currentUser;
  const navigate = useNavigate();

  const calcularTotal = () => {
    if (!requisicion.items) return 0;
    return requisicion.items.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0);
  };

  const verificarRequisicionFirmada = async () => {
    const flujoRef = collection(db, 'flujoDeFirmas');
    const querySnapshot = await getDocs(flujoRef);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.requisicionId === requisicion.id) {
        setRequisicionFirmada(true);
      }
    });
    setCargandoRequisicion(false); // Cambiar estado de carga al terminar
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
      const firmaData = firmaSnap.data();
      setFirmaExistente(firmaData);
      setEstadoFirma(firmaData.estado); 
      if (firmaData.estado !== 'autorizado') {
        Swal.fire({
          title: 'Firma no autorizada',
          text: 'Tu firma aún no ha sido autorizada. No puedes firmar la requisición hasta que otro usuario la autorice.',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
      }
    }
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
      if (estadoFirma !== 'autorizado') {
        Swal.fire({
          title: 'Firma no autorizada',
          text: 'Tu firma aún no ha sido autorizada. No puedes firmar la requisición hasta que el administrador la autorice.',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      Swal.fire({
        title: '¡Éxito!',
        text: 'Firma válida.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      setCodigoFirma(firmaExistente.codigo);
    } else {
      const nuevoCodigoFirma = generarCodigoFirma();
      await setDoc(doc(db, 'firmas', usuario.uid), {
        firma: firmaHash,
        codigo: nuevoCodigoFirma,
        usuarioId: usuario.uid,
        estado: 'pendiente'
      });
      Swal.fire({
        title: '¡Éxito!',
        text: 'Firma creada exitosamente. Código de firma: ' + nuevoCodigoFirma,
        icon: 'success',
        confirmButtonText: 'OK'
      });
      setCodigoFirma(nuevoCodigoFirma);
      setEstadoFirma('pendiente');
    }

    // Enviar el código a la colección flujoDeFirmas
    await addDoc(collection(db, 'flujoDeFirmas'), {
      requisicionId: requisicion.id,
      codigo: codigoFirma || firmaExistente.codigo
    });

    // Cambiar el estatus de la requisición a "En autorización"
    await updateDoc(doc(db, 'requisiciones', requisicion.id), {
      estatus: 'En autorización'
    });

    setFirmaValidada(true);
    setModalVisible(false);
    setMensajeError('');
    setFirma('');
  };

  useEffect(() => {
    if (requisicion) {
      obtenerFirmaExistente();
      verificarRequisicionFirmada(); // Verifica si la requisición ya está firmada
    }
  }, [requisicion]);

  if (!requisicion) {
    return <p>No hay detalles para mostrar</p>;
  }

  return (
    <div className="detalles-requisicion-container">
      <h3 className="detalles-requisicion-header">Detalles de la Requisición</h3>
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

      {firmaValidada ? (
        <div className="firma-validada">
          <p>Código de Firma: {codigoFirma}</p>
        </div>
      ) : cargandoRequisicion ? ( // Mostrar leyenda de carga si se está verificando
        <div className="cargando">
          <p>Cargando...</p>
        </div>
      ) : requisicionFirmada ? ( // Mostrar leyenda si ya está firmada
        <div className="requisicion-firmada">
          <p>Esta requisición ya ha sido firmada.</p>
        </div>
      ) : (
        <div>
          {firmaExistente ? (
            <button className="firmar-button" onClick={abrirModal}>
              Firmar Requisición
            </button>
          ) : (
            <button className="firmar-button" onClick={abrirModal}>
              Crear Firma
            </button>
          )}

          {modalVisible && (
            <div className="firma-modal">
              <div className="modal-content-firma">
                <h4>Firma</h4>
                <input
                  type="text"
                  maxLength={5}
                  value={firma}
                  onChange={(e) => setFirma(e.target.value)}
                  placeholder="Ingrese su firma de 5 dígitos"
                />
                {mensajeError && <p className="error-firma">{mensajeError}</p>}
                <button className="boton-firmar" onClick={firmarRequisicion}>Validar Firma</button>
                <button className="boton-cancelar" onClick={() => setModalVisible(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DetallesRequisicion;
