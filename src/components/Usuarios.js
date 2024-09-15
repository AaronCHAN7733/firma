import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './Navbar';
import TopBar from './TopBar';
import '../styles/Usuarios.css';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Importa Firebase Auth
import Modal from 'react-modal';
import Swal from 'sweetalert';
import { FaSearch } from 'react-icons/fa'; // Importa el ícono de lupa

Modal.setAppElement('#root');

function Usuarios({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    correo: '',
    nombre: '',
    role: '',
    telefono: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

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

    fetchUsers();
  }, []);

  const validateEmail = (email) => {
    const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com'];
    const emailParts = email.split('@');
    return emailParts.length === 2 && allowedDomains.includes(emailParts[1]);
  };

  const handleAddUser = async () => {
    if (!newUser.correo || !newUser.nombre || !newUser.role || !newUser.telefono || !newUser.password) {
      setError('Por favor, completa todos los campos');
      return;
    }
  
    if (!validateEmail(newUser.correo)) {
      setError('Por favor, ingresa un correo válido (e.g. @gmail.com, @outlook.com)');
      return;
    }
  
    try {
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
        estado: 'activo' // Establecer estado inicial
      });
  
      Swal({
        title: '¡Usuario Creado!',
        text: 'El nuevo usuario ha sido creado exitosamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
  
      setModalIsOpen(false);
      setNewUser({ correo: '', nombre: '', role: '', telefono: '', password: '' });
  
      // Actualizar la lista de usuarios
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usersList);
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      Swal({
        title: 'Error',
        text: 'Hubo un problema al crear el usuario. Revisa la consola para más detalles.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };
  

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({ correo: user.correo, nombre: user.nombre, role: user.role, telefono: user.telefono, password: '' });
    setModalIsOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!newUser.nombre || !newUser.role || !newUser.telefono) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      await setDoc(doc(db, 'users', editingUser.id), {
        nombre: newUser.nombre,
        role: newUser.role,
        telefono: newUser.telefono,
        estado: 'activo' // Mantener el estado
      }, { merge: true });

      Swal({
        title: '¡Usuario Actualizado!',
        text: 'El usuario ha sido actualizado exitosamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });

      setModalIsOpen(false);
      setEditingUser(null);
      setNewUser({ correo: '', nombre: '', role: '', telefono: '', password: '' });

      // Actualizar la lista de usuarios
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usersList);
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      Swal({
        title: 'Error',
        text: 'Hubo un problema al actualizar el usuario. Revisa la consola para más detalles.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const filteredUsuarios = usuarios.filter((user) =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.telefono.includes(searchTerm)
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
    setNewUser({ correo: '', nombre: '', role: '', telefono: '', password: '' });
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsuarios.map((user) => (
                <tr key={user.id}>
                  <td>{user.correo}</td>
                  <td>{user.nombre}</td>
                  <td>{user.role}</td>
                  <td>{user.telefono}</td>
                  <td>
                    <button onClick={() => handleEditUser(user)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Formulario de Usuario"
            className="Modal"
            style={{
              overlay: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              },
              content: {
                position: 'relative',
                maxWidth: '400px',
                width: '100%',
                padding: '20px',
                borderRadius: '10px',
                backgroundColor: '#e1f0fb',
              }
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
                <input
                  type="text"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
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
