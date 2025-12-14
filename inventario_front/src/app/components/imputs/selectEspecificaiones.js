'use client';

import { useState, useCallback ,useEffect} from 'react';
import CreatableSelect from 'react-select/creatable';
import API_URL from '@/config/apiConfig';
const CampoDinamicoSelect = ({ cod_especificacion, onChange,nombre,cod_equipo}) => {
  const [opciones, setOpciones] = useState([]);
  const [cargado, setCargado] = useState(false);
  const [valorSeleccionado, setValorSeleccionado] = useState(null);

  //funcion para buscar los detalles
  const cargarOpciones = useCallback(async (inputValue) => {
    try {
      const url = inputValue
        ? `${API_URL}/especificacion/valores?cod_especificacion=${cod_especificacion}&buscar=${inputValue}`
        : `${API_URL}/especificacion/valores?cod_especificacion=${cod_especificacion}`;

      const res = await fetch(url);
      const data = await res.json();

      const formateadas = data.map((item) => ({
        label: item.valor,
        value: item.valor,
      }));

      setOpciones(formateadas);
    } catch (err) {
      console.error('Error cargando opciones', err);
      setOpciones([]);
    }
  }, [cod_especificacion]);
  //funcion para buscar los detalles de los equipos
  const cargarDatosEspecifico = async(equipo)=>{
      try {
        const url = `${API_URL}/especificacion/detalleequipo?cod_especificacion=${cod_especificacion}&cod_equipo=${equipo}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if(data.length >0 ){
          const formateadas = { label: data[0].valor, value: data[0].valor };

          setValorSeleccionado(formateadas);
          onChange(formateadas.value);
        }
      } catch (error) {
        console.error('Error cargando opciones', err);
        setOpciones([]);
      }
  };
  //llama a la funcion de cargar datos especificos solo si le enviamos el codigo del equipo
   useEffect(() => {
          const equipo = cod_equipo;
          if(!cod_equipo) return;
          const cargarDatos = async () => {             
              await cargarDatosEspecifico(equipo);  // Espera a que termine antes de continuar              
          };
          
          cargarDatos();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      },[cod_equipo]);

  return (
    <CreatableSelect
      isClearable
      options={opciones}
      onInputChange={(inputValue) => {
        cargarOpciones(inputValue);
        return inputValue;
      }}
      value={valorSeleccionado}
      onMenuOpen={() => {
        if (!cargado) {
          cargarOpciones('');
          setCargado(true); // Para no volver a cargar cada vez que se abre
        }
      }}
      onChange={(opcion) => {
        setValorSeleccionado(opcion);
        onChange(opcion ? opcion.value : '');
      }}
      placeholder={`Seleccione ${nombre}`}
      required
    />
  );
};

export default CampoDinamicoSelect;
