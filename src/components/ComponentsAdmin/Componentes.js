import React from 'react';
import '../../styles/Areas.css';  // Reutilizamos el mismo archivo de estilos

function Componentes() {
    const componentes = [
      { descripcion: 'Componente A', codigoComponente: 'C001' },
      { descripcion: 'Componente B', codigoComponente: 'C002' },
      { descripcion: 'Componente C', codigoComponente: 'C003' },
      // Puedes añadir más componentes aquí si lo necesitas
    ];

    return (
      <div className="areas-container">
        <h1 className="areas-title">Componentes</h1>
        
        {/* Botón Agregar Componente */}
        <button className="add-area-btn">Agregar Componente</button>
        
        <table className="areas-table">
          <thead>
            <tr>
              <th>Código del Componente</th> {/* Nueva columna para Código del Componente */}
              <th>Descripción del Componente</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {componentes.map((componente, index) => (
              <tr key={index}>
                <td>{componente.codigoComponente}</td> {/* Nueva celda para el código */}
                <td>{componente.descripcion}</td>
                <td className="details-cell">
                  <button className="edit-btn-area">Editar</button>
                  <button className="delete-btn-area">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
}

export default Componentes;
