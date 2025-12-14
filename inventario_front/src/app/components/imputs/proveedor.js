'use client';

import { useState, useCallback, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import API_URL from '@/config/apiConfig';

function ProveedorSelect({ onChange ,selected }) {

    const [proveedor, setproveedor] = useState([]);
    const [cargado, setCargado] = useState(false);
    const [valorInicial, setValorInicial] = useState(null);

    const cargarProvedores = useCallback(async (inputValue) => {
    try {
      const url = inputValue
        ? `${API_URL}/proveedor?buscar=${inputValue}`
        : `${API_URL}/proveedor`;

      const res = await fetch(url);
      const data = await res.json();

      const formateadas = data.map((item) => ({
        label: item.nombre,
        value: item.cod_proveedor,
      }));

      setproveedor(formateadas);
    } catch (err) {
      console.error('Error cargando opciones', err);
      setproveedor([]);
    }
  }, []);

     useEffect(() => {
    const cargarProveedorPorId = async () => {
      if (selected) {
        try {
          const res = await fetch(`${API_URL}/proveedor?cod_proveedor=${selected}`);
          const data = await res.json();

          if (data.length > 0) {
            const prov = {
              label: data[0].nombre,
              value: data[0].cod_proveedor,
            };
            setValorInicial(prov); // mostrar en el select
            
          }
        } catch (err) {
          console.error('Error cargando proveedor inicial', err);
        }
      }
    };

    cargarProveedorPorId();
  }, [selected]);
    return (
    <CreatableSelect
      isClearable
      options={proveedor}
      value={valorInicial}
      
      onInputChange={(inputValue) => {
        cargarProvedores(inputValue);
        return inputValue;
      }}
      onMenuOpen={() => {
        if (!cargado) {
          cargarProvedores('');
          setCargado(true); // Para no volver a cargar cada vez que se abre
        }
      }}
      onChange={(proveedor) => {
        onChange(proveedor ? proveedor.value : '');
        setValorInicial(proveedor || null);
      }}
      placeholder={`Seleccione Proveedor`}
      required
    />
  );
}

export default ProveedorSelect;