import React from 'react';

// Este componente acepta 'props' para hacerlo flexible
const Input = ({
  label,           // Texto de la etiqueta del input (ej. "Usuario")
  id,              // ID único para el input (importante para accesibilidad)
  name,            // Atributo 'name' para formularios
  type = 'text',   // Tipo de input (text, password, email, number, etc.)
  placeholder,     // Texto del placeholder (ej. "Usuario")
  value,           // Valor actual del input (controlado por React)
  onChange,        // Función que se ejecuta cuando el valor cambia
  className = '',  // Clases adicionales de Tailwind para personalizar el input en situaciones específicas
  ...props         // Otras propiedades estándar de input HTML (disabled, required, min, max, etc.)
}) => {
  return (
    <div className="mb-4"> {/* Un contenedor para el label y el input */}
      {label && ( // Renderiza el label solo si se proporciona
        <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
          {label}:
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder || label} // Usa el label como placeholder si no se da uno específico
        value={value}
        onChange={onChange}
        // Clases base de Tailwind para el diseño consistente
        className={`
          w-full
          px-4 py-3
          border border-gray-300
          rounded-full
          focus:outline-none focus:ring-2 focus:ring-[var(--bg-principal)] focus:border-transparent
          text-gray-700 placeholder-gray-400
          ${className} // Aquí se añaden clases adicionales si se pasan
        `.trim()} // .trim() para limpiar espacios extra al inicio/final
        {...props} // Pasa cualquier otra prop adicional al input nativo
      />
    </div>
  );
};

export default Input;