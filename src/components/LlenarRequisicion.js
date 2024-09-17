import React, { useState, useEffect } from 'react';
import OperativoNavbar from './OperativoNavbar';
import TopBar from './TopBar';
import Swal from 'sweetalert';
import { db } from '../firebase';  // Importar Firestore
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';  // Funciones necesarias para agregar y leer de Firestore
import { auth } from '../firebase';  // Importar la autenticación
import '../styles/LlenarRequisicion.css';  // External CSS file for styling
import Select from 'react-select';
import PartidasPresupuestales from './PartidasPresupuestales';


function LlenarRequisicion() {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [formValues, setFormValues] = useState({
    cantidad: '',
    unidad: '',
    precioUnitario: '',
    concepto: '',
    partida: ''
  });
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formInfo, setFormInfo] = useState({
    areaSolicitante: '',
    direccionAdscripcion: '',
    concepto: '',
    fechaElaboracion: '',
    componente: '',
    nombreEvento: '',
    fechaEvento: '',
    folio: ''
  });
  const [userName, setUserName] = useState('');  // Estado para almacenar el nombre del usuario


  
  

  // Obtener el nombre del usuario autenticado desde Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;  // Obtener el usuario autenticado
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);  // Referencia al documento del usuario en la colección 'users'
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserName(userDoc.data().nombre);  // Establecer el nombre del usuario
        } else {
          console.error('No se encontró el documento del usuario');
        }
      }
    };

    fetchUserName();
  }, []);  // Ejecutar el efecto solo una vez cuando el componente se monte

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormInfoChange = (e) => {
    setFormInfo({
      ...formInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitItem = (e) => {
    e.preventDefault();
    const subtotal = parseFloat(formValues.cantidad) * parseFloat(formValues.precioUnitario);
    const newItem = {
      cantidad: formValues.cantidad,
      unidad: formValues.unidad,
      precioUnitario: formValues.precioUnitario,
      concepto: formValues.concepto,
      partida: formValues.partida,
      subtotal: subtotal,
    };
    setItems([...items, newItem]);
    setTotal(prevTotal => prevTotal + subtotal);
    setFormValues({
      cantidad: '',
      unidad: '',
      precioUnitario: '',
      concepto: '',
      partida: ''
    });
    closeModal(); // Cerrar el modal al enviar
  };

  const handleDelete = (index) => {
    const newItems = [...items];
    const removedItem = newItems.splice(index, 1)[0];
    setItems(newItems);
    setTotal(prevTotal => prevTotal - removedItem.subtotal);
  };

  const handleSubmitRequisicion = async (e) => {
    e.preventDefault();
  
    // Validar que todos los campos estén llenos y que haya al menos un item en la tabla
    if (
      !formInfo.areaSolicitante || !formInfo.direccionAdscripcion || !formInfo.concepto || 
      !formInfo.fechaElaboracion || !formInfo.componente || !formInfo.nombreEvento || 
      !formInfo.fechaEvento || !formInfo.folio || items.length === 0
    ) {
      Swal({
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos y agrega al menos un material o servicio.",
        icon: "warning",
        button: "Entendido"
      });
      
      return;
    }
  
    const user = auth.currentUser;  // Asegúrate de tener el usuario autenticado
    if (!user) {
      console.error('No se encontró el usuario autenticado');
      return;
    }
  
    // Datos que se van a enviar a Firestore, incluyendo el nombre del usuario y el estatus "En Firma"
    const requisicion = {
      ...formInfo,
      items,
      total,
      nombreUsuario: userName,  // Enviar el nombre del usuario obtenido de Firestore
      userId: user.uid,         // Guardar el ID del usuario autenticado
      estatus: "En Firma"       // Estatus automático "En Firma"
    };
  
    try {
      // Guardar en Firestore (en la colección "requisiciones")
      await addDoc(collection(db, 'requisiciones'), requisicion);
      Swal({
        title: "¡Éxito!",
        text: "Requisición enviada correctamente.",
        icon: "success",
        button: "Aceptar"
      });
      
    } catch (error) {
      console.error('Error al enviar requisición:', error);
    }
  
    // Reiniciar formulario
    setFormInfo({
      areaSolicitante: '',
      direccionAdscripcion: '',
      concepto: '',
      fechaElaboracion: '',
      componente: '',
      nombreEvento: '',
      fechaEvento: '',
      folio: ''
    });
    setItems([]);
    setTotal(0);
  };
  
  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <OperativoNavbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        <TopBar userName={userName || 'Operativo'} />  {/* Mostrar el nombre del usuario si está disponible */}

        <section className="content">
          <form className="requisition-form" onSubmit={handleSubmitRequisicion}>
            <h2>Requisición de material y/o servicio</h2>

            <div className="form-row">
              <label>Área solicitante:</label>
              <input type="text" name="areaSolicitante" value={formInfo.areaSolicitante} onChange={handleFormInfoChange} />
              <label>Dirección de Adscripción:</label>
              <input type="text" name="direccionAdscripcion" value={formInfo.direccionAdscripcion} onChange={handleFormInfoChange} />
              <label>Concepto:</label>
              <input type="text" name="concepto" value={formInfo.concepto} onChange={handleFormInfoChange} />
              <label>Fecha elaboración:</label>
              <input type="date" name="fechaElaboracion" value={formInfo.fechaElaboracion} onChange={handleFormInfoChange} />
            </div>

            <div className="form-row">
              <label>Componente:</label>
              <input type="text" name="componente" value={formInfo.componente} onChange={handleFormInfoChange} />
              <label>Nombre de evento:</label>
              <input type="text" name="nombreEvento" value={formInfo.nombreEvento} onChange={handleFormInfoChange} />
              <label>Fecha del evento:</label>
              <input type="text" name="fechaEvento" value={formInfo.fechaEvento} onChange={handleFormInfoChange} />
              <label>Folio:</label>
              <input type="text" name="folio" value={formInfo.folio} onChange={handleFormInfoChange} />
            </div>

            <h3>Agregar material y/o servicio</h3>

            <button type="button" className="submit-btn" onClick={openModal}>
              Agregar Material y/o Servicio
            </button>

            <h3>Lista de Materiales/Servicios</h3>
            <table className="requisition-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Precio Unitario</th>
                  <th>Concepto</th>
                  <th>Partida</th>
                  <th>Subtotal</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="8">No hay elementos en la lista</td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.cantidad}</td>
                      <td>{item.unidad}</td>
                      <td>{parseFloat(item.precioUnitario).toFixed(2)}</td>
                      <td>{item.concepto}</td>
                      <td>{item.partida}</td>
                      <td>{item.subtotal.toFixed(2)}</td>
                      <td>
                        <button type="button" onClick={() => handleDelete(index)} className="delete-btn">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="total-row">
              <label style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Total = {total.toFixed(2)}</label>
            </div>

            <button type="submit" className="submit-btn">Enviar</button>
          </form>
        </section>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Agregar Material y/o Servicio</h2>
              <form onSubmit={handleSubmitItem}>
                <div className="form-row">
                  <label>Cantidad:</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={formValues.cantidad}
                    onChange={handleChange}
                    required
                  />
                  <label>Unidad:</label>
                  <input
                    type="text"
                    name="unidad"
                    value={formValues.unidad}
                    onChange={handleChange}
                    required
                  />
                  <label>Precio unitario:</label>
                  <input
                    type="number"
                    name="precioUnitario"
                    value={formValues.precioUnitario}
                    onChange={handleChange}
                    required
                  />
                  <label>Concepto:</label>
                  <input
                    type="text"
                    name="concepto"
                    value={formValues.concepto}
                    onChange={handleChange}
                    required
                  />
                  <label>Partida:</label>
                  <Select
                     options={PartidasPresupuestales}
                      onChange={(selectedOption) => setFormValues({ ...formValues, partida: selectedOption.value })}
                      value={PartidasPresupuestales.find(option => option.value === formValues.partida)}
                   />
                </div>
                <button type="submit" className="submit-btn-modal">Agregar</button>
                <button type="button" className="cancel-btn-modal" onClick={closeModal}>Cancelar</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default LlenarRequisicion;
