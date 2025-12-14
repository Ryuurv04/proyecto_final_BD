'use client'

import { useEffect, useState,useCallback,useRef } from 'react';
import EquipoAsignacion from './formularios/equiposAsignacion';
import DetalleAsignacion from './formularios/detalleAsignacion';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useRouter} from 'next/navigation';
import { IoIosArrowBack } from "react-icons/io";
import API_URL from '@/config/apiConfig';

const MySwal = withReactContent(Swal);
export default function NuevaAsignacion() {
    const [error, setError] = useState(null);
    const formRef = useRef();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1); // 1: Equipos, 2: Detalles
    const [equipos, setEquipos] = useState([]);
    
    //  accion del boton para regresar a la pantalla de asignaciones o regresar en el registro
    const regresar = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else {
            router.replace('/admin/asignacion');
        }
    }, [currentStep, router]);

    const registrarEquipo = useCallback(async(codEquipo)=>{

        if (equipos.some(v => String(v.cod_equipo) === String(codEquipo))) {
            MySwal.fire('Advertencia', `El vehículo ${codEquipo} ya está en la lista.`, 'warning');
            return;
        }
        try {
            const url = `${API_URL}/equipos/${codEquipo}`;
            const response = await fetch(url);
            
            if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cargar los productos');
            }
            const data = await response.json();
            setEquipos (prev => [...prev, {
                cod_equipo: data[0].cod_equipo,
                marbete: data[0].marbete,
                estado: data[0].estado,
                tipo_equipo: data[0].tipo_equipo
                
            }]);
        } catch (error) {
            setError(err.message || 'No se pudieron cargar los productos. Inténtalo de nuevo.');
        }
    },[equipos]);

    const eliminarEquipo = useCallback(async (cod_equipo) => {
        setEquipos(prev=>prev.filter(v => String(v.cod_equipo) !== String(cod_equipo) ));
    },[]);


    const siguientePaso = () =>{
        if (currentStep === 1) {
            if(equipos.length === 0){
                MySwal.fire('Advertencia', 'Debes añadir al menos un Equipo', 'warning');
                return;
            }
        }
        setCurrentStep(prev => prev + 1);
    };
    const guardar = async () =>{
        const url = `${API_URL}/asignacion`
        try {
            const detalleAsignacion = formRef.current
            if(detalleAsignacion){
                const detalles =  detalleAsignacion.getFormData();
                const detalleCompleto = {
                    ...detalles,
                    equipos: equipos
                }
                const response = await fetch(url+'/new',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(detalleCompleto),
            
                });
            
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al asignar');
                }
                const result = await response.json();
                MySwal.fire({ icon: 'success', title: '¡Éxito!', text: result.message, timer: 2000, showConfirmButton: false ,position: "top-end",toast: true,timerProgressBar: true});
                router.push('/admin/asignacion');
            }else{
                MySwal.fire({ icon: 'error', title: 'Error al enviar los datos', text: result.message, timer: 2000, showConfirmButton: false ,position: "top-end",toast: true,timerProgressBar: true});
            }
        } catch (error) {
            console.log(error)
        }
        

    }
    return(
        <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 md:text-left text-center">Asignaciones</h1>


        {/* Tabla de Productos */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto ">

            <button
                onClick={regresar}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center mb-6"
            >
                <IoIosArrowBack className="mr-2" />
                {currentStep === 1 ? 'Regresar' : 'Paso Anterior'}
            </button>   
            <div className="mb-6">
                <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span className={`px-3 py-1 rounded-full ${currentStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>1. Equipos</span>
                    <span className={`px-3 py-1 rounded-full ${currentStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>2. Detalles</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className={`bg-blue-500 h-1.5 rounded-full transition-all duration-500 ease-in-out`}
                            style={{ width: `${(currentStep - 1) * 50}%` }}></div>
                </div>
            </div>               
            
            <form>
                {currentStep === 1 && (
                    <EquipoAsignacion 
                        equipoData={equipos}
                        setSelectEquipos={setEquipos}
                        setSelectedEquipos={registrarEquipo}
                        elimiarEquios={eliminarEquipo}
                        
                    />
                )}
                {currentStep === 2 && (
                    <DetalleAsignacion 
                        ref={formRef}
                    />
                )}
                <div className="flex justify-end mt-6">
                        {currentStep < 2 && (
                            <button
                                type="button"
                                onClick={siguientePaso}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors shadow-lg"
                            >
                                Siguiente Paso
                            </button>
                        )}
                        {currentStep === 2 && (
                            <button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors shadow-lg flex items-center"
                                onClick={guardar}
                            >
                                Registrar Alquiler
                            </button>
                        )}
                    </div>
            </form>
            

            
        </div>

    </div>
    );
}