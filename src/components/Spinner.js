// Archivo: Spinner.js
import React from 'react';
import '../styles/Spinner.css';

const Spinner = () => (
  <div className="spinner">
    {[...Array(8)].map((_, i) => (
      <div key={i}></div>
    ))}
  </div>
);

export default Spinner;
