'use client'

import { useEffect, useState,useCallback,useRef } from 'react';
import Tabla from '../../components/tabla';
import BotonAgregar from '../../components/botonAgregar';
import Paginacion from '../../components/imputs/paginacion';
import Swal from 'sweetalert2';
import { useRouter} from 'next/navigation';
import withReactContent from 'sweetalert2-react-content';
import FormAcciones from '../asignacion/nuevo/formularios/formAsignacion'
/* Iconos*/
import { FaArrowsRotate } from "react-icons/fa6";
import { MdOutlineClear } from "react-icons/md"
import { FaFilter   } from "react-icons/fa";
import API_URL from '@/config/apiConfig';

const MySwal = withReactContent(Swal);

export default function Asignacion() {
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros,setFiltros] = useState('');
    const [error, setError] = useState(null);
    const [pagina,setPagina] = useState(1);
    const [limite,setLimite] = useState(6);
    const [totalpagina,setTotalPagina] = useState(1);
    const formRef = useRef();
    const formAcc = useRef();
    const router = useRouter();
    //buscador de las asignaciones
    const buscarAsignacion = useCallback(async()=>{
      setLoading(true);
      setError(null);
      try {
        const url = `${API_URL}/asignacion?pag=${pagina}&limite=${limite}`; // URL sin query params
        const response = await fetch(url);
        console.log(response)
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cargar los productos');
        }

        const data = await response.json();

        setAsignaciones(data.data);
        setTotalPagina(data.totalPages);
        
      } catch (err) {       
        setError(err.message || 'No se pudieron cargar los productos. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    },[pagina,limite]);
    // useEffect para cargar asignaciones al montar el componente (solo una vez al inicio)
    useEffect(() => {
        buscarAsignacion();
    }, [buscarAsignacion]);

    // cambio de pagina
    const handlePaginaCambio = (nuevaPagina) => {
      setPagina(nuevaPagina);
    };

    const nuevaAsignacion = () =>{
      router.push('/admin/asignacion/nuevo');
    }

    const abrirAccionesAsignacion = (datos_asignacion)=>{
      MySwal.fire({
              title: `${datos_asignacion.equipo}[${datos_asignacion.marbete}]`,
              html: (<FormAcciones ref={formAcc} initialData={datos_asignacion}/>),
              showCancelButton:true,
              width: "900px",
              confirmButtonText: "Realizar Devolución",
              cancelButtonText: "Cancelar",
              focusConfirm: false,
              preConfirm: () => {
                // Se ejecuta antes de que se cierre el modal al hacer clic en "Guardar"
                const formRetorno = formAcc.current;
                console.log(formRetorno.getFormData())
                if (formRetorno) {
                    if (!formRetorno.getFormData().firma_entrega || !formRetorno.getFormData().firma_recibe) {
                        Swal.showValidationMessage('Por favor, Debe firmar.');
                        return false; // No cierra el modal si la validación falla
                    }
                    return formRetorno.getFormData(); // Retorna los datos del formulario
                }
                return false; // Si no hay instancia de formulario, no cierra
              }
            }).then((result)=>{
              if(result.isConfirmed){
                devolucionAsignacion(result.value);
              }
            });
    }
    const devolucionAsignacion = async(data)=>{
        console.log('devolucion:',data)
          const url = `${API_URL}/asignacion/devolucion`;
        try {

                const response = await fetch(url,{
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),

                });
            
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al asignar');
                }
                const result = await response.json();
                MySwal.fire({ icon: 'success', title: '¡Éxito!', text: result.message, timer: 2000, showConfirmButton: false ,position: "top-end",toast: true,timerProgressBar: true});
                buscarAsignacion();
        } catch (error) {
            console.log(error)
        }
        
    }
    return(
        <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 md:text-left text-center">Asignaciones</h1>

        {/* Tabla de Productos */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <div className="block md:justify-between md:items-center mb-4 md:flex">
              <div className='flex justify-between md:gap-2 items-center md:mb-0 mb-4'>
                  <h2 className="text-xl font-semibold text-black ">Lista de Asignaciones</h2>
                  <button onClick={buscarAsignacion}
                  title='Actualizar'
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                  >
                    <FaArrowsRotate />
                  </button>
                  <button 
                  title='Actualizar'
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                  >
                    <FaFilter  />
                  </button>
                  
              </div>

              <div className='md:mb-0 mb-4'>
                  <BotonAgregar  texto='Nueva Asignación' onClick={nuevaAsignacion}/>
              </div>
              
              
              
          </div>

          {loading && <p className="text-center text-[var(--bg-principal)]">Cargando asignaciones...</p>}
          {error && <p className="text-center text-red-600">Error: {error}</p>}
          {!loading && !error && asignaciones.length === 0 && (
            <p className="text-center text-gray-500">No se encontraron asignaciones.</p>
          )}

          {!loading && !error && asignaciones.length > 0 && (
            
            <Tabla data={asignaciones} ocultarColumna={[7,8]} onclick={(datos_asignacion)=>abrirAccionesAsignacion(datos_asignacion)}/>
          )}
          <Paginacion
                pagina={pagina}
                totalPaginas={totalpagina}
                onPaginaCambio={handlePaginaCambio}
            />
        </div>

    </div>
    );


};
