import React, { useState, useEffect } from "react";
import ReceptorNavbar from "./ReceptorNavnbar";
import TopBar from "../TopBar";
import Swal from "sweetalert";
import { db } from "../../firebase"; // Importar Firestore
import { collection, addDoc, doc, getDoc, getDocs } from "firebase/firestore"; // Funciones necesarias para agregar y leer de Firestore
import { auth } from "../../firebase"; // Importar la autenticación
import "../../styles/LlenarRequisicion.css"; // External CSS file for styling
import Select from "react-select";

const customStyles = {
  control: (provided) => ({
    ...provided,
    width: "100%", // Ancho del Select (puedes ajustarlo según sea necesario)
    maxWidth: "100%", // Ancho máximo si deseas limitarlo
    padding: "5px", // Espacio interno
  }),
};

function LlenarRequisicionReceptor() {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [items, setItems] = useState([]);
  const [componentes, setComponentes] = useState([]); // Estado para almacenar los componentes

  const [formValues, setFormValues] = useState({
    cantidad: "",
    unidad: "",
    precioUnitario: "",
    concepto: "",
    partida: "",
  });
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formInfo, setFormInfo] = useState({
    areaSolicitante: "",
    direccionAdscripcion: "",
    concepto: "",
    fechaElaboracion: "",
    componente: "",
    nombreEvento: "",
    fechaEvento: "",
    folio: "",
  });
  const [userName, setUserName] = useState(""); // Estado para almacenar el nombre del usuario
  const [partidas, setPartidas] = useState([]); // Estado para almacenar las partidas obtenidas de Firebase
  const [areas, setAreas] = useState([]); // Estado para almacenar las áreas obtenidas de Firebase
  const [isEvento, setIsEvento] = useState(false); // Estado para controlar si es un evento

  // Obtener el nombre del usuario autenticado desde Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser; // Obtener el usuario autenticado
      if (user) {
        const userDocRef = doc(db, "users", user.uid); // Referencia al documento del usuario en la colección 'users'
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserName(userDoc.data().nombre); // Establecer el nombre del usuario
        } else {
          console.error("No se encontró el documento del usuario");
        }
      }
    };

    fetchUserName();
  }, []); // Ejecutar el efecto solo una vez cuando el componente se monte

  // Obtener las partidas desde Firestore
  useEffect(() => {
    const fetchPartidas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "partidas")); // Obtener la colección 'partidas'
        const partidasData = querySnapshot.docs.map((doc) => ({
          value: doc.data().descripcion, // Usar la descripción del documento como valor
          label: doc.data().descripcion, // Mostrar la descripción
        }));
        setPartidas(partidasData); // Establecer las partidas en el estado
      } catch (error) {
        console.error("Error al cargar las partidas:", error);
      }
    };

    fetchPartidas();
  }, []); // Ejecutar el efecto solo una vez cuando el componente se monte
  useEffect(() => {
    const fetchComponentes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "componentes")); // Obtener la colección 'componentes'
        const componentesData = querySnapshot.docs.map((doc) => ({
          value: `${doc.data().codigoComponente} - ${doc.data().descripcion}`, // Usar el código del componente como valor
          label: `${doc.data().codigoComponente} - ${doc.data().descripcion}`, // Mostrar el código y la descripción
        }));
        setComponentes(componentesData); // Establecer los componentes en el estado
      } catch (error) {
        console.error("Error al cargar los componentes:", error);
      }
    };

    fetchComponentes();
  }, []);
  // Obtener las áreas y direcciones desde Firestore
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "areas")); // Obtener la colección 'areas'
        const areasData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          value: doc.data().descripcion, // Usar la descripción del área como valor
          label: doc.data().descripcion, // Mostrar la descripción
          direccionId: doc.data().direccionId, // Relación con la colección 'direccion'
        }));
        setAreas(areasData); // Establecer las áreas en el estado
      } catch (error) {
        console.error("Error al cargar las áreas:", error);
      }
    };

    fetchAreas();
  }, []); // Ejecutar el efecto solo una vez cuando el componente se monte

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
      [e.target.name]: e.target.value,
    });
  };

  // Función para manejar la selección de área y obtener la dirección asociada
  const handleAreaChange = async (selectedOption) => {
    setFormInfo({
      ...formInfo,
      areaSolicitante: selectedOption.value,
      areaId: selectedOption.id, // Guardar areaId en formInfo
    });

    const direccionId = selectedOption.direccionId;
    if (direccionId) {
      const direccionDocRef = doc(db, "direcciones", direccionId);
      const direccionDoc = await getDoc(direccionDocRef);
      if (direccionDoc.exists()) {
        setFormInfo((prevFormInfo) => ({
          ...prevFormInfo,
          direccionAdscripcion: direccionDoc.data().descripcion,
          direccionId: direccionId, // Guardar direccionId en formInfo
        }));
      } else {
        console.error("No se encontró la dirección asociada");
      }
    }
  };

  const handleSubmitItem = (e) => {
    e.preventDefault();
    const subtotal =
      parseFloat(formValues.cantidad) * parseFloat(formValues.precioUnitario);
    const newItem = {
      cantidad: formValues.cantidad,
      unidad: formValues.unidad,
      precioUnitario: formValues.precioUnitario,
      concepto: formValues.concepto,
      partida: formValues.partida,
      subtotal: subtotal,
    };
    setItems([...items, newItem]);
    setTotal((prevTotal) => prevTotal + subtotal);
    setFormValues({
      cantidad: "",
      unidad: "",
      precioUnitario: "",
      concepto: "",
      partida: "",
    });
    closeModal(); // Cerrar el modal al enviar
  };

  const handleDelete = (index) => {
    const newItems = [...items];
    const removedItem = newItems.splice(index, 1)[0];
    setItems(newItems);
    setTotal((prevTotal) => prevTotal - removedItem.subtotal);
  };

  const handleSubmitRequisicion = async (e) => {
    e.preventDefault();
    const user = auth.currentUser; // Verificar usuario autenticado
    if (!user) {
      console.error("No se encontró el usuario autenticado");
      return;
    }

    // Verificar qué campos faltan
    const missingFields = [];
    if (!formInfo.areaSolicitante) missingFields.push("Área solicitante");
    if (!formInfo.direccionAdscripcion)
      missingFields.push("Dirección de adscripción");
    if (!formInfo.concepto) missingFields.push("Concepto");
    if (!formInfo.fechaElaboracion) missingFields.push("Fecha de elaboración");
    if (!formInfo.componente) missingFields.push("Componente");

    // Si el checkbox de evento está activo, verificar esos campos también
    if (isEvento) {
      if (!formInfo.nombreEvento) missingFields.push("Nombre del evento");
      if (!formInfo.fechaEvento) missingFields.push("Fecha del evento");
    }

    // Verificar si hay al menos un ítem en la tabla
    const missingItems = items.length === 0;

    // Generar mensajes combinados de validación
    if (missingItems && missingFields.length > 0) {
      Swal({
        title: "Campos incompletos y sin ítems",
        text: `Debe agregar al menos un ítem a la tabla y llenar los siguientes campos: ${missingFields.join(
          ", "
        )}`,
        icon: "warning",
        button: "Aceptar",
      });
      return; // Detener la ejecución si faltan ítems y campos
    }

    if (missingItems) {
      Swal({
        title: "Sin ítems",
        text: "Debe agregar al menos un ítem a la tabla.",
        icon: "warning",
        button: "Aceptar",
      });
      return; // Detener la ejecución si no hay ítems
    }

    if (missingFields.length > 0) {
      Swal({
        title: "Campos incompletos",
        text: `Los siguientes campos son obligatorios: ${missingFields.join(
          ", "
        )}`,
        icon: "warning",
        button: "Aceptar",
      });
      return; // Detener la ejecución si faltan campos
    }

    // Crear el objeto de requisición
    const requisicion = {
      ...formInfo,
      items,
      total,
      nombreUsuario: userName,
      userId: user.uid,
      estatus: "En Firma",
      areaId: formInfo.areaId,
      direccionId: formInfo.direccionId,
      nombreEvento: isEvento ? formInfo.nombreEvento : "No aplica",
      fechaEvento: isEvento ? formInfo.fechaEvento : "No aplica",
    };

    try {
      await addDoc(collection(db, "requisiciones"), requisicion);
      Swal({
        title: "¡Éxito!",
        text: "Requisición enviada correctamente.",
        icon: "success",
        button: "Aceptar",
      });
    } catch (error) {
      console.error("Error al enviar requisición:", error.message);
      Swal({
        title: "Error",
        text: "Ocurrió un error al enviar la requisición. Por favor, intente nuevamente.",
        icon: "error",
        button: "Aceptar",
      });
    }

    // Reiniciar el formulario y los estados
    setFormInfo({
      areaSolicitante: "",
      direccionAdscripcion: "",
      concepto: "",
      fechaElaboracion: "",
      componente: "",
      nombreEvento: "",
      fechaEvento: "",
      folio: "",
    });
    setItems([]);
    setTotal(0);
  };

  return (
    <div className={`admin-container ${isSidebarVisible ? "shifted" : ""}`}>
      <button
        className={`hamburger-btn ${isSidebarVisible ? "shifted" : ""}`}
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <ReceptorNavbar
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />

      <main className={`main-content ${isSidebarVisible ? "shifted" : ""}`}>
        <TopBar userName={userName || "Operativo"} />{" "}
        {/* Mostrar el nombre del usuario si está disponible */}
        <section className="content">
          <div className="content-container">
            <form
              className="requisition-form"
              onSubmit={handleSubmitRequisicion}
            >
              <h2>Requisición de material y/o servicio</h2>

              <div className="form-row">
                <label>Área solicitante:</label>
                <Select
                  options={areas} // Usar las áreas obtenidas de Firebase
                  onChange={handleAreaChange}
                  value={
                    areas.find(
                      (area) => area.value === formInfo.areaSolicitante
                    ) || null
                  }
                  styles={customStyles}
                />
                <label>Dirección de Adscripción:</label>
                <input
                  type="text"
                  name="direccionAdscripcion"
                  value={formInfo.direccionAdscripcion}
                  readOnly
                />
                <label>Concepto:</label>
                <input
                  type="text"
                  name="concepto"
                  value={formInfo.concepto}
                  onChange={handleFormInfoChange}
                />
                <label>Fecha elaboración:</label>
                <input
                  type="date"
                  name="fechaElaboracion"
                  value={formInfo.fechaElaboracion}
                  onChange={handleFormInfoChange}
                />
              </div>

              <div className="form-row">
                <label>Componente:</label>
                <Select
                  options={componentes} // Usar los componentes obtenidos de Firebase
                  onChange={(selectedOption) =>
                    setFormInfo({
                      ...formInfo,
                      componente: selectedOption.value,
                    })
                  } // Manejar la selección
                  value={
                    componentes.find(
                      (option) => option.value === formInfo.componente
                    ) || null
                  } // Establecer el valor seleccionado
                  styles={customStyles}
                />

                <label>Folio:</label>
                <input
                  type="text"
                  name="folio"
                  value={formInfo.folio}
                  onChange={handleFormInfoChange}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={isEvento}
                    onChange={(e) => setIsEvento(e.target.checked)}
                  />
                  ¿Es un evento?
                </label>

                {isEvento && (
                  <div className="form-row">
                    <label>Nombre de evento:</label>
                    <input
                      type="text"
                      name="nombreEvento"
                      value={formInfo.nombreEvento}
                      onChange={handleFormInfoChange}
                    />

                    <label>Fecha del evento:</label>
                    <input
                      type="text"
                      name="fechaEvento"
                      value={formInfo.fechaEvento}
                      onChange={handleFormInfoChange}
                    />
                  </div>
                )}
              </div>

              <h3>Agregar material y/o servicio</h3>

              <button
                type="button"
                className="add-item-btn"
                onClick={openModal}
              >
                + Agregar Material o Servicio
              </button>
              <div className="table-container-items">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                      <th>Precio Unitario</th>
                      <th>Concepto</th>
                      <th>Partida</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.cantidad}</td>
                        <td>{item.unidad}</td>
                        <td>{item.precioUnitario}</td>
                        <td>{item.concepto}</td>
                        <td>{item.partida}</td>
                        <td>{item.subtotal.toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => handleDelete(index)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="total">
                <strong>Total:&nbsp;&nbsp;</strong> { total.toFixed(2)}
              </div>

              <button type="submit" className="submit-btn">
                Enviar Requisición
              </button>
            </form>
          </div>
        </section>
      </main>

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
                  options={partidas} // Usar las partidas obtenidas de Firebase
                  onChange={(selectedOption) =>
                    setFormValues({
                      ...formValues,
                      partida: selectedOption.value,
                    })
                  }
                  value={partidas.find(
                    (option) => option.value === formValues.partida
                  )}
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-btn-modal">
                  Agregar
                </button>
                <button
                  type="button"
                  className="cancel-btn-modal"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default LlenarRequisicionReceptor;

