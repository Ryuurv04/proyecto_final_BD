
import React, { useState, useEffect } from 'react';
import Select from 'react-select'; 
import API_URL from '@/config/apiConfig';
const API_URL_COMPLETA = `${API_URL}/tipoequipo`; 

function TipoEquipoSelect({ onSelectTipo, selectedTipo, accionTipo}) {

    const [tiposequipos, setTipoEquipo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [disable,setDisable]=useState(false);

    useEffect(() => {
        const fetchTipos = async () => {
            try {
                const response = await fetch(API_URL_COMPLETA);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                 const formattedOptions = data.map(tipo => ({
                    value: tipo.cod_tipoequipo,
                    label: tipo.tipoequipo,
                }));
                setTipoEquipo(formattedOptions);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching tipos de vehículo:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTipos();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar

    useEffect(() => {
        if (accionTipo === 'E') {
            setDisable(true); // Deshabilita los campos si la acción es 'E' (Editar)
        } else {
            setDisable(false); // Habilita los campos para otras acciones (ej. 'A' de Añadir)
        }
        
    }, [accionTipo]);
    //Busca en las opciones que retorno el api
    const escribiendo =(selectedOption) =>{
        onSelectTipo(selectedOption ? selectedOption.value : '' );

    };
    //si envian un valor lo pone por defecto
    const selectedOptionValue = tiposequipos.find(
        option => option.value === selectedTipo
    );

    if (loading) {
        return <p>Cargando tipos de equipo...</p>;
    }

    if (error) {
        return <p className="text-red-500">Error al cargar tipos de equipos: {error}</p>;
    }

    
    return (
            <Select
            id="tipoEquipo"
            value={selectedOptionValue} // Le pasa la opción completa (objeto {value, label})
            onChange={escribiendo}
            options={tiposequipos}
            isDisabled={disable}
            placeholder="Tipo de equipo"
            isClearable // Permite borrar la selección
            isSearchable // Habilita la búsqueda
            
        />
       
    );
}

export default TipoEquipoSelect;