import React, { useState, useEffect } from 'react';
import '../../styles/Areas.css';
import { db } from '../../firebase'; // Importa tu configuración de Firebase
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Swal from 'sweetalert2'; // Importa SweetAlert2

function Areas() {
  const [areas, setAreas] = useState([]);
  const [direcciones, setDirecciones] = useState([]); // Estado para almacenar direcciones
  const [newArea, setNewArea] = useState('');
  const [selectedDireccion, setSelectedDireccion] = useState(''); // ID de la dirección seleccionada
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos editando
  const [currentAreaId, setCurrentAreaId] = useState(null); // Guardar el área actual en edición

  // Función para cargar las áreas desde Firestore
  const fetchAreas = async () => {
    const querySnapshot = await getDocs(collection(db, 'areas')); // Asume que tienes una colección llamada 'areas'
    const areasList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setAreas(areasList);
  };

  // Función para cargar las direcciones desde Firestore
  const fetchDirecciones = async () => {
    const querySnapshot = await getDocs(collection(db, 'direcciones')); // Asume que tienes una colección llamada 'direcciones'
    const direccionesList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setDirecciones(direccionesList);
  };

  useEffect(() => {
    fetchAreas(); // Carga las áreas al montar el componente
    fetchDirecciones(); // Carga las direcciones al montar el componente
  }, []);

  // Función para agregar o editar un área
  const handleSaveArea = async () => {
    if (newArea && selectedDireccion) {
      if (isEditing) {
        // Si estamos en modo edición, actualizamos el área
        const areaDoc = doc(db, 'areas', currentAreaId);
        await updateDoc(areaDoc, { descripcion: newArea, direccionId: selectedDireccion });
        const updatedAreas = areas.map((area) =>
          area.id === currentAreaId ? { ...area, descripcion: newArea, direccionId: selectedDireccion } : area
        );
        setAreas(updatedAreas);
        Swal.fire('¡Éxito!', 'El área ha sido actualizada correctamente.', 'success'); // Confirmación de edición
      } else {
        // Si estamos agregando una nueva área
        const docRef = await addDoc(collection(db, 'areas'), {
          descripcion: newArea,
          direccionId: selectedDireccion,
        });
        setAreas([...areas, { id: docRef.id, descripcion: newArea, direccionId: selectedDireccion }]);

        // SweetAlert2 de confirmación
        Swal.fire({
          title: '¡Área Agregada!',
          text: 'La nueva área ha sido agregada correctamente.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      }

      setNewArea(''); // Limpiar el input
      setSelectedDireccion(''); // Limpiar el campo de selección
      setIsModalOpen(false); // Cerrar modal después de guardar
      setIsEditing(false); // Reiniciar el modo de edición
      setCurrentAreaId(null); // Limpiar el área actual en edición
    }
  };

  // Función para eliminar un área
  const handleDeleteArea = async (id, descripcion) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el área: ${descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d9534f',
      cancelButtonColor: '#6c757d',
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, 'areas', id));
      setAreas(areas.filter((area) => area.id !== id));
      Swal.fire('¡Eliminado!', 'El área ha sido eliminada correctamente.', 'success');
    }
  };

  // Función para abrir el modal en modo de edición
  const handleEditArea = (id, descripcion, direccionId) => {
    setNewArea(descripcion); // Llenar el campo de entrada con la descripción existente
    setSelectedDireccion(direccionId); // Seleccionar la dirección actual
    setCurrentAreaId(id); // Establecer el ID del área que estamos editando
    setIsEditing(true); // Cambiar a modo de edición
    setIsModalOpen(true); // Abrir el modal
  };

  return (
    <div className="areas-container">
      <h1 className="areas-title">Áreas</h1>

      {/* Botón para abrir el modal en modo agregar */}
      <button className="add-area-btn" onClick={() => {
        setIsModalOpen(true);
        setIsEditing(false); // Modo agregar
        setNewArea(''); // Limpiar el campo de entrada
        setSelectedDireccion(''); // Limpiar la selección de dirección
      }}>Agregar Área</button>

      {/* Modal para agregar o editar área */}
      {isModalOpen && (
        <div className="modal-area">
          <div className="modal-content-area">
            <h2>{isEditing ? 'Editar Área' : 'Agregar Nueva Área'}</h2>
            <input
              type="text"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="Nombre del área"
              className="modal-input-area"
            />
            <select
              value={selectedDireccion}
              onChange={(e) => setSelectedDireccion(e.target.value)}
              className="modal-input-area"
            >
              <option value="">Selecciona una dirección</option>
              {direcciones.map((direccion) => (
                <option key={direccion.id} value={direccion.id}>
                  {direccion.descripcion}
                </option>
              ))}
            </select>
            <div className="modal-buttons">
              <button className="modal-add-btn" onClick={handleSaveArea}>
                {isEditing ? 'Guardar Cambios' : 'Agregar'}
              </button>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

<table className="areas-table">
  <thead>
    <tr>
      <th>Descripción del Área</th>
      <th>Dirección</th>
      <th>Detalles</th>
    </tr>
  </thead>
  <tbody>
    {areas.map((area) => {
      const direccion = direcciones.find(direccion => direccion.id === area.direccionId);
      return (
        <tr key={area.id}>
          <td>{area.descripcion}</td>
          {/* Mostrar clave UR junto con la descripción */}
          <td>{direccion ? `${direccion.claveUR} ${direccion.descripcion}` : 'Sin dirección'}</td>
          <td className="details-cell">
            <button
              className="edit-btn-area"
              onClick={() => handleEditArea(area.id, area.descripcion, area.direccionId)}
            >
              Editar
            </button>
            <button
              className="delete-btn-area"
              onClick={() => handleDeleteArea(area.id, area.descripcion)}
            >
              Borrar
            </button>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

    </div>
  );
}

export default Areas;
