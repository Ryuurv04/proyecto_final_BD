'use client';
import { useEffect, useState,useCallback,useRef } from 'react';
import Tabla from '../../components/tabla';
import BotonAgregar from '../../components/botonAgregar';
import Paginacion from '../../components/imputs/paginacion';
import FormularioAgregarEquipo from './formularios/nuevoEquipo';
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
        const url = `${API_URL}/equipos?pag=${pagina}&limite=${limite}&busqueda=${busqueda}`; // URL sin query params
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

    // useEffect para cargar productos al montar el componente (solo una vez al inicio)
    useEffect(() => {
      const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        buscarEquipos();
    }, [buscarEquipos]); // Ejecuta cuando fetchProducts cambia (solo una vez al inicio)

    //realiza todas las acciones de la pantalla yas ea insertar o editar  
    const accionesInventario = async (data,accion) =>{
      let url =  `${API_URL}/equipos`;

      if(accion === 'I'){
        
        url = url+'/add';
       try {
            const response = await fetch(url,{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            
            });
             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al añadir vehículo.');
            }
            const result = await response.json();
            MySwal.fire({ icon: 'success', title: '¡Éxito!', text: result.message, timer: 2000, showConfirmButton: false ,position: "top-end",toast: true,timerProgressBar: true});
            buscarEquipos(); // Recargar la lista después de añadir
       } catch (error) {
            console.error('Error al registrar vehículo:', error);
            MySwal.fire({ icon: 'error', title: 'Error', text: `No se pudo registrar el vehículo: ${error.message}` ,position: "top-end",toast: true, timer: 5000,timerProgressBar: true});
       }
        
      }
      if(accion === 'E'){
        url+='/'+data.cod_equipo;
        console.log(data);
        try {
            const response = await fetch(url,{
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            
            });
             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al Editar el equipó');
            }
            const result = await response.json();
            MySwal.fire({ icon: 'success', title: '¡Éxito!', text: result.message, timer: 2000, showConfirmButton: false ,position: "top-end",toast: true,timerProgressBar: true});
            buscarEquipos(); // Recargar la lista después de añadir
       } catch (error) {
            console.error('Error al editar el equipo:', error);
            MySwal.fire({ icon: 'error', title: 'Error', text: `No se pudo editar el equipo: ${error.message}` ,position: "top-end",toast: true, timer: 5000,timerProgressBar: true});
       }
        console.log(data)
      }
    };
    const limpiarBusqueda = () =>{
        setBusqueda('');
    };
    //formulario para agregar equipos
    const agregarEquipo = () =>{
      MySwal.fire({
        title: "Agregar Equipo",
        html: (<FormularioAgregarEquipo accion={'I'} usuario={user} ref={formRef} />),
        showCancelButton:true,
        width: "900px",
        confirmButtonText: "Agrega Equipo",
        cancelButtonText: "Cancelar",
        focusConfirm: false,
        preConfirm: () => {
          // Se ejecuta antes de que se cierre el modal al hacer clic en "Guardar"
          const formInstance = formRef.current;
          if (formInstance) {
              if (!formInstance.validate()) {                
                  Swal.showValidationMessage('Por favor, completa todos los campos requeridos.');
                  return false; // No cierra el modal si la validación falla
              }
              return formInstance.getFormData(); // Retorna los datos del formulario
          }
          return false; // Si no hay instancia de formulario, no cierra
        }
      }).then((result)=>{
        if(result.isConfirmed){
          
          accionesInventario(result.value,'I');
        }
      });
    };
     //formulario para editar el equipo
    const editarEquipo = (equipo) =>{
      
      MySwal.fire({
        title: "Agregar Equipo",
        html: (<FormularioAgregarEquipo initialData={equipo} accion={'E'} usuario={user} ref={formRef} />),
        showCancelButton:true,
        width: "900px",
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        focusConfirm: false,
        preConfirm: () => {
          // Se ejecuta antes de que se cierre el modal al hacer clic en "Guardar"
          const formInstance = formRef.current;
          if (formInstance) {
              if (!formInstance.validate()) {
                  Swal.showValidationMessage('Por favor, completa todos los campos requeridos.');
                  return false; // No cierra el modal si la validación falla
              }
              return formInstance.getFormData(); // Retorna los datos del formulario
          }
          return false; // Si no hay instancia de formulario, no cierra
        }
      }).then((result)=>{
        if(result.isConfirmed){
          accionesInventario(result.value,'E');
        }
      });
    };
    const handlePaginaCambio = (nuevaPagina) => {
        setPagina(nuevaPagina);
    };

    const exportarDatos = ()=>{
      exportToExcel(
          equipos,         // Los datos que queremos exportar
          'LISTADO_EQUIPOS',   // Nombre del archivo de salida
          'EQUIPOS'            // Nombre de la hoja dentro de Excel
      );
    }


    
    return(
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 md:text-left text-center">Inventario de Productos</h1>


        {/* Tabla de Productos */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <div className="block md:justify-between md:items-center mb-4 md:flex">
              <div className='flex justify-between md:gap-2 items-center md:mb-0 mb-4'>
                  <h2 className="text-xl font-semibold text-black ">Lista de Equipos</h2>
                  <button onClick={buscarEquipos}
                  title='Actualizar'
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                  >
                    <FaArrowsRotate />
                  </button>
                  
                  
              </div>
              <div className='flex items-center rounded-lg overflow-hidden border border-gray-300 md:mb-0 mb-4'>
                <input  value={busqueda} onChange={(e) => setBusqueda(e.target.value)} type='text' placeholder='Buscar Equipo' className=' w-full md:w-80 px-3  focus:outline-none'/>
                <button onClick={ busqueda?  limpiarBusqueda : buscarEquipos }
                  className="bg-gray-200 text-gray-700 px-4 py-2 h-full hover:bg-gray-300 transition-colors flex items-center"
                >
                  {busqueda?
                    <MdOutlineClear/>
                    :
                    <FaSearch />
                  }
                </button>
              </div>
              <div className='md:mb-0 mb-4'>
                  <BotonAgregar onClick={agregarEquipo} texto='Añadir Equipo'/>
              </div>
              
              
          </div>

          {loading && <p className="text-center text-[var(--bg-principal)]">Cargando productos...</p>}
          {error && <p className="text-center text-red-600">Error: {error}</p>}
          {!loading && !error && equipos.length === 0 && (
            <p className="text-center text-gray-500">No se encontraron productos en el inventario.</p>
          )}

          {!loading && !error && equipos.length > 0 && (
            <Tabla data={equipos} ocultarColumna={[0,1,7,8,9]} onclick={(equipo)=>editarEquipo(equipo)}/>
            
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