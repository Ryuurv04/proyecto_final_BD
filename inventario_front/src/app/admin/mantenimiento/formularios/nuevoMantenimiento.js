
import React, { useState, forwardRef, useImperativeHandle,useEffect ,useRef} from 'react';
import API_URL from '@/config/apiConfig';
import CamporFirma from '@/app/components/campoFirma'

const ManteniminetoForm = forwardRef(( {onSubmit, cod_equipo,usuario} , ref) => {
    const refFirmaResponsable = useRef();
    const refFirmaTecnico = useRef();
    const [tareas, setTareas] = useState([]);
    const [tareasListas, setTareasListas] = useState([]);
    const [formData, setFormData] = useState({            
        cod_equipo: cod_equipo || '',
        fecha: new Date().toISOString().split('T')[0],
        usuario: 0,
        firma_responsable:  '', 
        firma_tecnico:  '',            
        observacion:  ''           
    });
    useEffect(() => {
        const obtenerTareas = async () => {
            try {
                const response = await fetch(`${API_URL}/mantenimientos/listamantenimiento`);
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                const datosTareas = await response.json();
                
                setTareas(datosTareas);
                
            } catch (error) {
                console.error("Error al cargar las tareas:", error);
                
            }
        };

        obtenerTareas();
        const datosUsuario = localStorage.getItem('user');
        if(datosUsuario){
            try {
                const objetoUsuario = JSON.parse(datosUsuario);
                const codigoUsuario = objetoUsuario.cod_usuario;
                setFormData(prevData => ({
                    ...prevData,
                    usuario: codigoUsuario,
                }));
            } catch (error) {
                console.error("Error al parsear los datos del usuario:", error);
            }
        }
    }, []);
    const firmaResponsable = (firma)=>{
        setFormData(prevData => ({
            ...prevData,
            firma_responsable: firma,
        }));
    }
    const firmaTecnico = (firma)=>{
        setFormData(prevData => ({
            ...prevData,
            firma_tecnico: firma,
        }));
    }

    const handleCheck = (e) => {
    // 1. Obtiene el ID numérico (value) del checkbox
    const codTrabajo = parseInt(e.target.value); 
    // 2. Obtiene el estado booleano (true/false)
    const isChecked = e.target.checked; 

    setTareasListas(prevList => {
        if (isChecked) {
            // Si el checkbox está marcado, AÑADIR el ID a la lista (si no existe ya)
            if (!prevList.includes(codTrabajo)) {
                return [...prevList, codTrabajo];
            }
        } else {
            // Si el checkbox está desmarcado, FILTRAR y REMOVER el ID de la lista
            return prevList.filter(id => id !== codTrabajo);
        }
        // Si el ID ya existe y se intentó agregar de nuevo, devuelve el estado anterior.
        return prevList;
    });
};

    useImperativeHandle(ref, () => ({
        getFormData: () => {formData
            return{
                ...formData,
                detalleMantenimiento: tareasListas
            };
        }
    }));
    const observacionCambio = (dato) =>{
        setFormData(prevData => ({
                ...prevData,
                observacion: dato.target.value,                
            }));
    }
    return(
        <div>
            <div className=' md:grid md:grid-cols-2 text-left '>            
                {/* Aquí iteras sobre la variable 'tareas' para crear los checkboxes */}
                {tareas.map((tarea) => (
                    <div className='flex justify-between p-2' key={tarea.cod_trabajo}>
                        
                        <label htmlFor={`tarea-${tarea.cod_trabajo}`}>{tarea.descripcion}</label>
                        <input 
                            type="checkbox" 
                            className='scale-[2]'
                            id={`tarea-${tarea.cod_trabajo}`} 
                            value={tarea.cod_trabajo}
                            onChange={handleCheck}
                            
                            // 2. CONTROL DEL ESTADO: Mantiene el input marcado/desmarcado
                            // Verifica si el ID de esta tarea existe en el array 'tareasListas'
                            checked={tareasListas.includes(parseInt(tarea.cod_trabajo))}
                            // Puedes agregar aquí una función para manejar el 'check'
                        />
                    </div>
                ))}           
            </div>
            <div className='flex flex-col mt-4 '>
                <label  className=" text-gray-700 mb-2 text-left">Observacion</label>
                <textarea className='border h-24' onChange={observacionCambio}/>
            </div>
            <div className='md:p-4 p-6 text-left md:grid md:grid-cols-2 md:gap-4 flex flex-col gap-2'>
                <div className="mb-4 ">
                    <label className=" text-gray-700 mb-2">Firma Responsable</label>
                    <CamporFirma ref={refFirmaResponsable} firmaCambia={firmaResponsable}/>
                </div>
                <div className="mb-4 ">
                    <label className=" text-gray-700 mb-2">Firma TIC</label>
                    <CamporFirma ref={refFirmaTecnico} firmaCambia={firmaTecnico}/>
                </div>
            </div>
        </div>
    );

});

ManteniminetoForm.displayName = 'MantenimientoForm'; // Para debugging con React DevTools

export default ManteniminetoForm;