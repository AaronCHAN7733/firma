import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../Navbar';
import TopBar from '../TopBar';
import '../../styles/Usuarios.css';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; // Importa Firebase Auth
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { FaSearch } from 'react-icons/fa'; // Importa el ícono de lupa
import Select from 'react-select';

Modal.setAppElement('#root');

function Usuarios({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [direcciones, setDirecciones] = useState([]); // Estado para direcciones
  const [areas, setAreas] = useState([]); // Estado para áreas
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    correo: '',
    nombre: '',
    role: '',
    telefono: '',
    password: '',
    direccionId: '', // Cambiar campo de dirección a direccionId
    areaId: '' // Añadir campo para área
  });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [direccionFilter, setDireccionFilter] = useState(''); // Estado para el filtro de dirección

  const auth = getAuth(); // Inicializa Firebase Auth

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsuarios(usersList);
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    };

    const fetchDirecciones = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'direcciones'));
        const direccionesList = querySnapshot.docs.map(doc => ({ id: doc.id, descripcion: doc.data().descripcion }));
        setDirecciones(direccionesList);
      } catch (error) {
        console.error("Error al obtener las direcciones:", error);
      }
    };

   // Asegúrate de que el campo comuna esté incluido en la colección de áreas
const fetchAreas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'areas'));
    const areasList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      descripcion: doc.data().descripcion,
      direccionId: doc.data().direccionId,
      comuna: doc.data().comuna // Asegúrate de incluir el campo comuna
    }));
    setAreas(areasList);
  } catch (error) {
    console.error("Error al obtener las áreas:", error);
  }
};

    fetchUsers();
    fetchDirecciones();
    fetchAreas(); // Obtener las áreas al cargar el componente
  }, []);

  const validateEmail = (email) => {
    const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com','utrivieramaya.edu.mx'];
    const emailParts = email.split('@');
    return emailParts.length === 2 && allowedDomains.includes(emailParts[1]);
  };
  
  const handleAddUser = async () => {
    if (!newUser.correo || !newUser.nombre || !newUser.role || !newUser.telefono || !newUser.password || !newUser.direccionId) {
      setError('Por favor, completa todos los campos');
      return;
    }
  
    if (!validateEmail(newUser.correo)) {
      setError('Por favor, ingresa un correo válido (e.g. @gmail.com, @outlook.com)');
      return;
    }
  
    const auth = getAuth();
    const adminUser = auth.currentUser; // Guardar al usuario administrador actual
  
    try {
      // Pedir la contraseña del administrador
      const { value: adminPassword } = await Swal.fire({
        title: 'Ingrese su contraseña',
        input: 'password',
        inputLabel: 'Contraseña de administrador',
        inputPlaceholder: 'Ingrese su contraseña actual',
        inputAttributes: {
          autocapitalize: 'off',
          required: true
        },
        showCancelButton: true
      });
  
      if (!adminPassword) {
        throw new Error("No se proporcionó la contraseña del administrador.");
      }
  
      // Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.correo, newUser.password);
      const createdUser = userCredential.user;
  
      // Usar el UID de Firebase Authentication como ID del documento en Firestore
      await setDoc(doc(db, 'users', createdUser.uid), {
        uid: createdUser.uid,
        correo: newUser.correo,
        nombre: newUser.nombre,
        role: newUser.role,
        telefono: newUser.telefono,
        direccionId: newUser.direccionId,
        areaId: newUser.areaId,
        estado: 'activo'
      });
  
      // Mostrar alerta de éxito
      Swal.fire({
        title: '¡Usuario Creado!',
        text: 'El nuevo usuario ha sido creado exitosamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
  
      // Limpiar los datos del formulario pero mantener el modal abierto
      setNewUser({ correo: '', nombre: '', role: '', telefono: '', password: '', direccionId: '', areaId: '' });
      setError('');
  
      // Actualizar la lista de usuarios sin cerrar el modal
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usersList);
  
      // Restaurar la sesión del usuario administrador
      if (adminUser) {
        await signInWithEmailAndPassword(auth, adminUser.email, adminPassword); // Re-autentica al administrador
      }
  
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al crear el usuario. Revisa la consola para más detalles.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };
  

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      correo: user.correo,
      nombre: user.nombre,
      role: user.role,
      telefono: user.telefono,
      password: '',
      direccionId: user.direccionId || '', // Cambiar a direccionId
      areaId: user.areaId || '' // Añadir área
    });
    setModalIsOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!newUser.nombre || !newUser.role || !newUser.telefono || !newUser.direccionId) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      await setDoc(doc(db, 'users', editingUser.id), {
        nombre: newUser.nombre,
        role: newUser.role,
        telefono: newUser.telefono,
        direccionId: newUser.direccionId, // Actualizar direccionId
        areaId: newUser.areaId, // Actualizar área seleccionada
        estado: 'activo' // Mantener el estado
      }, { merge: true });

      Swal.fire({
        title: '¡Usuario Actualizado!',
        text: 'El usuario ha sido actualizado exitosamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });

      setModalIsOpen(false);
      setEditingUser(null);
      setNewUser({ correo: '', nombre: '', role: '', telefono: '', password: '', direccionId: '', areaId: '' });

      // Actualizar la lista de usuarios
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usersList);
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar el usuario. Revisa la consola para más detalles.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleAreaChange = (areaId) => {
    const selectedArea = areas.find(area => area.id === areaId);
    if (selectedArea) {
      setNewUser({ ...newUser, areaId, direccionId: selectedArea.direccionId });
    }
  };

  const filteredUsuarios = usuarios.filter((user) =>
    (user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telefono.includes(searchTerm)) &&
    (direccionFilter === '' || user.direccionId === direccionFilter)
  );

  const sortedUsuarios = useMemo(() => {
    if (!sortConfig.key) return filteredUsuarios;

    return [...filteredUsuarios].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredUsuarios, sortConfig]);

  const sortUsuarios = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const openModal = () => {
    setModalIsOpen(true);
    setEditingUser(null);
    setError('');
  };

  const closeModal = () => {
    setModalIsOpen(false);
    //setNewUser({ correo: '', nombre: '', role: '', telefono: '', password: '', direccionId: '', areaId: '' });
    setError('');
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
        <h1>Usuarios</h1>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>

          <button className="add-user-btn" onClick={openModal}>Agregar Usuario</button>

          <table className="user-table">
  <thead>
    <tr>
      <th onClick={() => sortUsuarios('correo')}>
        Correo {sortConfig.key === 'correo' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
      </th>
      <th onClick={() => sortUsuarios('nombre')}>
        Nombre {sortConfig.key === 'nombre' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
      </th>
      <th onClick={() => sortUsuarios('role')}>
        Rol {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
      </th>
      <th onClick={() => sortUsuarios('telefono')}>
        Teléfono {sortConfig.key === 'telefono' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
      </th>
      <th onClick={() => sortUsuarios('direccionId')}>
        Dirección {sortConfig.key === 'direccionId' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
      </th>
      <th onClick={() => sortUsuarios('areaId')}>
        Área {sortConfig.key === 'areaId' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
      </th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    {sortedUsuarios.map((user) => {
      const userArea = areas.find(area => area.id === user.areaId);
      return (
        <tr key={user.id}>
          <td>{user.correo}</td>
          <td>{user.nombre}</td>
          <td>{user.role}</td>
          <td>{user.telefono}</td>
          <td>{direcciones.find(d => d.id === user.direccionId)?.descripcion || 'No disponible'}</td>
          <td>{userArea ? userArea.descripcion : 'No disponible'}</td> {/* Mostrar el área */}
          <td>
            <button onClick={() => handleEditUser(user)}>Editar</button>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
<Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        shouldCloseOnOverlayClick={false} // Evita cerrar el modal al hacer clic fuera del mismo
        shouldCloseOnEsc={false} // Evita cerrar el modal con la tecla Escape
        contentLabel="Formulario de Usuario"
        className="Modal-user"
        style={{
          overlay: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          content: {
            position: 'relative',
            maxWidth: '400px',
            width: '100%',
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: '#e1f0fb',
          },
        }}
      >
        <h2>{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
        <form>
          <label>
            Correo:
            <input
              type="email"
              value={newUser.correo}
              onChange={(e) => setNewUser({ ...newUser, correo: e.target.value })}
              disabled={!!editingUser}
            />
          </label>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <label>
            Nombre:
            <input
              type="text"
              value={newUser.nombre}
              onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
            />
          </label>
          <label>
  Rol:
  <Select
    options={[
      { value: 'secretario', label: 'Secretario' },
      { value: 'solicitante', label: 'Solicitante' },
      { value: 'autorizante', label: 'Autorizante' },
      { value: 'bloqueado', label: 'Bloqueado' },
      { value: 'receptor', label: 'Receptor' },
      { value: 'admin', label: 'Admin' },
    ]}
    value={newUser.role ? { value: newUser.role, label: newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1) } : null}
    onChange={(selected) => setNewUser({ ...newUser, role: selected.value })}
    placeholder="Seleccionar rol"
  />
</label>

          <label>
            Área:
            <Select
              options={areas.map(area => ({ value: area.id, label: area.descripcion }))}
              value={newUser.areaId ? { value: newUser.areaId, label: areas.find(area => area.id === newUser.areaId)?.descripcion } : null}
              onChange={(selected) => handleAreaChange(selected.value)}
              placeholder="Seleccionar área"
            />
          </label>
          <label>
            Dirección:
            <Select
              options={direcciones.map(direccion => ({ value: direccion.id, label: direccion.descripcion }))}
              value={newUser.direccionId ? { value: newUser.direccionId, label: direcciones.find(d => d.id === newUser.direccionId)?.descripcion } : null}
              onChange={(selected) => setNewUser({ ...newUser, direccionId: selected.value })}
              placeholder="Seleccionar dirección"
            />
          </label>
          <label>
            Teléfono:
            <input
              type="text"
              value={newUser.telefono}
              onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
            />
          </label>
          {!editingUser && (
            <label>
              Contraseña:
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </label>
          )}
        </form>
        <div className="modal-buttons">
          <button onClick={editingUser ? handleUpdateUser : handleAddUser}>
            {editingUser ? 'Actualizar' : 'Agregar'}
          </button>
          <button onClick={closeModal}>Cancelar</button>
        </div>
      </Modal>
        </section>
      </main>
    </div>
  );
}

export default Usuarios;
