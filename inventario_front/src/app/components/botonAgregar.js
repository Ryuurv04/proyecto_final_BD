// src/components/NuevoBoton.js
import React from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

const NuevoBoton = ({ onClick, texto = 'Agregar Nuevo', className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center
        w-full
        md:w-auto
        bg-[var(--bg-principal)] text-white
        px-6 py-3 rounded-full shadow-lg
        hover:bg-[var(--principal-hover)] transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-[var(--principal-ring)] focus:ring-offset-2
        ${className} /* Permite añadir clases adicionales desde donde se usa el componente */
      `}
    >
      <FaPlus className="w-5 h-5 mr-2" />
      <span>{texto}</span> {/* Texto del botón */}
    </button>
  );
};
    
export default NuevoBoton;