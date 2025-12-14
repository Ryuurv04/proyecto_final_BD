'use client';
import { useEffect, useState,useCallback,useRef } from 'react';
import Tabla from '../../components/tabla';
import BotonAgregar from '../../components/botonAgregar';
import Paginacion from '../../components/imputs/paginacion';
import FormularioMantenimiento from './formularios/nuevoMantenimiento';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
/* Iconos*/
import { FaArrowsRotate } from "react-icons/fa6";
import { MdOutlineClear } from "react-icons/md"
import { FaSearch  } from "react-icons/fa";
import API_URL from '@/config/apiConfig';


const MySwal = withReactContent(Swal);

export default function Inventario() {
    const [equipos, setEquipos] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busqueda,setBusqueda] = useState('');
    const [error, setError] = useState(null);
    const [pagina,setPagina] = useState(1);
    const [limite,setLimite] = useState(6);
    const [totalpagina,setTotalPagina] = useState(1);
    const formRef = useRef();
    //busca los equipos
    const buscarEquipos = useCallback(async()=>{
      setLoading(true);
      setError(null);
      try {
        const url = `${API_URL}/mantenimientos?pag=${pagina}&limite=${limite}&busqueda=${busqueda}`; // URL sin query params
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cargar los productos');
        }

        const data = await response.json();
        setEquipos(data.data);
        setTotalPagina(data.totalPages);
        
      } catch (err) {       
        setError(err.message || 'No se pudieron cargar los productos. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    },[pagina,limite,busqueda]);

        useEffect(() => {
      const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        buscarEquipos();
    }, [buscarEquipos]); // Ejecuta cuando fetchProducts cambia (solo una vez al inicio)


   const handlePaginaCambio = (nuevaPagina) => {
        setPagina(nuevaPagina);
    };

    const mantenimientoEquipo = (equipo) =>{
          MySwal.fire({
            title: `Mantenimiento de Equipo ${equipo.marbete}`,
            html: (<FormularioMantenimiento cod_equipo={equipo.cod_equipo} ref={formRef} />),
            showCancelButton:true,
            width: "1010px",
            confirmButtonText: "Registrar Mantenimiento",
            cancelButtonText: "Cancelar",
            allowScroll: true,
            focusConfirm: false,
            grow: 'fullscreen',
            preConfirm: () => {
              // Se ejecuta antes de que se cierre el modal al hacer clic en "Guardar"
              const formInstance = formRef.current;
              if (formInstance) {
                const datos = formInstance.getFormData()
                return formInstance.getFormData(); // Retorna los datos del formulario
                  
              }
              return false; // Si no hay instancia de formulario, no cierra
            }
          }).then((result)=>{
            if(result.isConfirmed){
              registrarMantenimiento(result.value);
            }
          });
        };
    const registrarMantenimiento = async(data) =>{
        const url = `${API_URL}/mantenimientos`;
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
                buscarEquipos();
        } catch (error) {
            console.log(error)
        }
        
    }
    return(
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 md:text-left text-center">Mantenimientos</h1>


        {/* Tabla de Productos */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <div className="block md:justify-between md:items-center mb-4 md:flex">
              <div className='flex justify-between md:gap-2 items-center md:mb-0 mb-4'>
                  <h2 className="text-xl font-semibold text-black ">Lista de Mantenimientos Pendientes</h2>
                  <button 
                  title='Actualizar'
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                  >
                    <FaArrowsRotate />
                  </button>
                  
                  
              </div>

              
              
          </div>

          {loading && <p className="text-center text-[var(--bg-principal)]">Cargando equipos...</p>}
          {error && <p className="text-center text-red-600">Error: {error}</p>}
          {!loading && !error && equipos.length === 0 && (
            <p className="text-center text-gray-500">No se encontraron mantenimientos pendientes.</p>
          )}

          {!loading && !error && equipos.length > 0 && (
            <Tabla  data={equipos} ocultarColumna={[0,1]} onclick={(equipo)=>mantenimientoEquipo(equipo)}/>
            
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