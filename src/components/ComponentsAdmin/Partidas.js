import React, { useState, useEffect } from 'react';
import '../../styles/Areas.css'; // Reutilizamos el mismo archivo de estilos
import { db } from '../../firebase'; // Importa tu configuración de Firebase
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Swal from 'sweetalert2'; // Importa SweetAlert2
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';

function Partidas() {
  const [partidas, setPartidas] = useState([]);
  const [newPartida, setNewPartida] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos editando
  const [currentPartidaId, setCurrentPartidaId] = useState(null); // Guardar la partida actual en edición
  const [itemsPerPage, setItemsPerPage] = useState(10); // Estado para controlar cuántas partidas mostrar

  // Función para cargar las partidas desde Firestore
  const fetchPartidas = async () => {
    const querySnapshot = await getDocs(collection(db, 'partidas')); // Asume que tienes una colección llamada 'partidas'
    const partidasList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Ordenar las partidas por descripción de menor a mayor
    const sortedPartidas = partidasList.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
    
    setPartidas(sortedPartidas);
  };

  useEffect(() => {
    fetchPartidas(); // Carga las partidas al montar el componente
  }, []);

  // Función para agregar o editar una partida
  const handleSavePartida = async () => {
    if (newPartida) {
      if (isEditing) {
        // Si estamos en modo edición, actualizamos la partida
        const partidaDoc = doc(db, 'partidas', currentPartidaId);
        await updateDoc(partidaDoc, { descripcion: newPartida });

        // Actualizar la lista de partidas y ordenar
        const updatedPartidas = partidas.map((partida) =>
          partida.id === currentPartidaId ? { ...partida, descripcion: newPartida } : partida
        ).sort((a, b) => a.descripcion.localeCompare(b.descripcion));
        
        setPartidas(updatedPartidas);
        Swal.fire('¡Éxito!', 'La partida ha sido actualizada correctamente.', 'success'); // Confirmación de edición
      } else {
        // Si estamos agregando una nueva partida
        const docRef = await addDoc(collection(db, 'partidas'), { descripcion: newPartida });

        // Añadir la nueva partida y ordenar
        const newPartidas = [...partidas, { id: docRef.id, descripcion: newPartida }]
          .sort((a, b) => a.descripcion.localeCompare(b.descripcion));

        setPartidas(newPartidas);

        // SweetAlert2 de confirmación
        Swal.fire({
          title: '¡Partida Agregada!',
          text: 'La nueva partida ha sido agregada correctamente.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      }

      setNewPartida(''); // Limpiar el input
      setIsModalOpen(false); // Cerrar modal después de guardar
      setIsEditing(false); // Reiniciar el modo de edición
      setCurrentPartidaId(null); // Limpiar la partida actual en edición
    }
  };

  // Función para eliminar una partida
  const handleDeletePartida = async (id, descripcion) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar la partida: ${descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d9534f',
      cancelButtonColor: '#6c757d',
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, 'partidas', id));

      // Eliminar la partida y ordenar
      const updatedPartidas = partidas.filter((partida) => partida.id !== id)
        .sort((a, b) => a.descripcion.localeCompare(b.descripcion));
        
      setPartidas(updatedPartidas);
      Swal.fire('¡Eliminado!', 'La partida ha sido eliminada correctamente.', 'success');
    }
  };

  // Función para abrir el modal en modo de edición
  const handleEditPartida = (id, descripcion) => {
    setNewPartida(descripcion); // Llenar el campo de entrada con la descripción existente
    setCurrentPartidaId(id); // Establecer el ID de la partida que estamos editando
    setIsEditing(true); // Cambiar a modo de edición
    setIsModalOpen(true); // Abrir el modal
  };

  // Filtrar las partidas según el término de búsqueda
  const filteredPartidas = partidas.filter((partida) =>
    partida.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Controlar la paginación
  const paginatedPartidas = filteredPartidas.slice(0, itemsPerPage);

  return (
    <div className="areas-container">
      <h1 className="areas-title">Partidas</h1>

      {/* Campo de búsqueda */}
      <div className="search-container">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar partida..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      

      {/* Botón para abrir el modal en modo agregar */}
      <button className="add-area-btn" onClick={() => {
        setIsModalOpen(true);
        setIsEditing(false); // Modo agregar
        setNewPartida(''); // Limpiar el campo de entrada
      }}>Agregar Partida</button>
      {/* Select para controlar cuántas partidas mostrar */}
      <div className="select-mostrar-datos">
        <label>Mostrar: </label>
        <select onChange={(e) => setItemsPerPage(Number(e.target.value))} value={itemsPerPage}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
          <option value={partidas.length}>Todos</option>
        </select>
      </div>

      {/* Modal para agregar o editar partida */}
      {isModalOpen && (
        <div className="modal-area">
          <div className="modal-content-area">
            <h2>{isEditing ? 'Editar Partida' : 'Agregar Nueva Partida'}</h2>
            <input
              type="text"
              value={newPartida}
              onChange={(e) => setNewPartida(e.target.value)}
              placeholder="Descripción de la partida"
              className="modal-input-area"
            />
            <div className="modal-buttons">
              <button className="modal-add-btn" onClick={handleSavePartida}>
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
            <th>Descripción de la Partida</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPartidas.map((partida) => (
            <tr key={partida.id}>
              <td>{partida.descripcion}</td>
              <td className="details-cell">
                <button
                  className="edit-btn-area"
                  onClick={() => handleEditPartida(partida.id, partida.descripcion)}
                >
                  <FontAwesomeIcon icon={faEdit} /> 
                </button>
                <button
                  className="delete-btn-area"
                  onClick={() => handleDeletePartida(partida.id, partida.descripcion)}
                >
                  <FontAwesomeIcon icon={faTrash} /> 
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Partidas;
