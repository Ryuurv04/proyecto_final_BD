
import React, { useState, forwardRef, useImperativeHandle,useEffect,useRef } from 'react';
import DetalleAsignacion from './detalleAsignacion';
import EquiposAsignacion from './equiposAsignacion';
import Usuarios from '@/app/components/imputs/usuarios';
import SelectUsuario from '../../../../components/imputs/usuarios'
import CamporFirma from '../../../../components/campoFirma'

const FormAsignaciones = forwardRef(({accion,onSubmit, initialData = {}},ref) =>{
    const [errors, setErrors] = useState({});
    const [user,setUser] = useState(null)
    const refFirmaEntrega = useRef();
    const refFirmaRecibe = useRef();
    const [asignacionData,setAsignacionData] = useState({
        cod_asignacion: initialData.cod_asignacion,
        equipo: initialData.equipo,
        marbete: initialData.marbete,
        usuario: initialData.usuario,
        recibe: initialData.usuario_asigno,
        usuario_recibe: 0,
        firma_entrega: '',
        firma_recibe: '',
        accion: 'R',

    });
    useEffect(() => {
        const datosUsuario = localStorage.getItem('user');
        const parsedUser = JSON.parse(datosUsuario);
        if(parsedUser){
            try {
                setAsignacionData(prevData => ({
                    ...prevData,
                    usuario_recibe: parsedUser.cod_usuario,
                }));
                setAsignacionData(prevData => ({
                    ...prevData,
                    recibe: `${parsedUser.nombre} ${parsedUser.apellido}`,
                }));
            } catch (error) {
                console.error("Error al parsear los datos del usuario:", error);
            }
        }
    }, []);
    
    useImperativeHandle(ref, () => ({
        getFormData: () => asignacionData,  
    }));
    
    const firmaEntrega = (firma)=>{
        setAsignacionData(prevData => ({
            ...prevData,
            firma_entrega: firma,
        }));
    }
    const firmaRecibe = (firma)=>{
        setAsignacionData(prevData => ({
            ...prevData,
            firma_recibe: firma,
        }));
    }
    const cambioUsuarioRecibe = (usuario_recibe) => {
        setAsignacionData(prevData => ({
            ...prevData,
            usuario_recibe: usuario_recibe,
        }));
    }
    
    return(
        <div>
            <div className="md:p-4 p-6 text-left md:grid md:grid-cols-2 md:gap-4 flex flex-col gap-2">
                <div className="mb-4 ">
                    <label className=" text-gray-700 mb-2">Usuario Entrega al Equipo</label>
                    <input className="shadow mb-1 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={asignacionData.usuario} readOnly={true}/>
                    <CamporFirma ref={refFirmaEntrega} firmaCambia={firmaEntrega}/>
                </div>
                <div className="mb-4 ">
                    <label className=" text-gray-700 mb-2">Usuario Recibe el Equipo</label>
                    <input className="shadow mb-1 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={asignacionData.recibe} readOnly={true}/>                    
                    <CamporFirma ref={refFirmaRecibe} firmaCambia={firmaRecibe}/>
                </div>
            </div>

        </div>
    );
});

FormAsignaciones.displayName = 'AddAsignacionForm'; // Para debugging con React DevTools

export default FormAsignaciones;