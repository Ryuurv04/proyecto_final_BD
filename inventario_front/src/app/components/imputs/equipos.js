
import React, { useState, useEffect } from 'react';
import Select from 'react-select'; 
import API_URL from '@/config/apiConfig';
const API_URL_COMPLETO = `${API_URL}/equipos/disponibles`; 
function EquiposDisponibles({ onSelectEquipo,  selectedEquipo}) {
    const [equipos,setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTipos = async () => {
            try {
                const response = await fetch(API_URL_COMPLETO);
                console.log(response)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                    const formattedOptions = data.map(tipo => ({
                    value: tipo.cod_equipo,
                    label: tipo.tipo_equipo+' ['+tipo.marbete+']',
                }));
                setEquipos(formattedOptions);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching tipos de vehículo:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTipos();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar

    const escribiendo =(selectedOption) =>{
        onSelectEquipo(selectedOption ? selectedOption.value : '' );

    };
    //si envian un valor lo pone por defecto
    const selectedOptionValue = equipos.find(
        option => option.value === selectedEquipo
    );

    return (
            <Select
            id="EquipoSelect"
            value={selectedOptionValue} // Le pasa la opción completa (objeto {value, label})
            onChange={escribiendo}
            options={equipos}            
            placeholder="Equipos"
            isClearable // Permite borrar la selección
            isSearchable // Habilita la búsqueda
            
        />
    );
}

export default EquiposDisponibles;