'use client'
import React, { useState, useEffect, useRef,useImperativeHandle, useCallback,forwardRef } from 'react';
import { FaCamera, FaUpload, FaTrashAlt, FaPlayCircle, FaStopCircle, FaPlusCircle } from "react-icons/fa";
import SelectUsuario from '../../../../components/imputs/usuarios'
import CamporFirma from '../../../../components/campoFirma'


const EquiposAsignacion = forwardRef ((  setSelectedDetalle,ref)=> {
    const [detalleAsignacion, setDetalleAsignacion] = useState({
        usuario_entrega: '',
        usuario_recibe: '',
        observacion: '',
        firma_asigno: '',
        firma: ''
    });
    const refFirmaEntrega = useRef();
    const refFirmaRecibe = useRef();
    const[usurio,setUsuario]=useState(null);
    /*cod_usuario_entrega,cod_usuario_recibe,observacion,firma_entrega, firma_recibe  setSelectedDetalle*/
    
    useEffect(() => {
        const datosUsuario = localStorage.getItem('user');
        if(datosUsuario){
            try {
                const objetoUsuario = JSON.parse(datosUsuario);
                const codigoUsuario = objetoUsuario.cod_usuario;
                setUsuario(codigoUsuario);
                cambioUsuarioEntrega(codigoUsuario)
            } catch (error) {
                console.error("Error al parsear los datos del usuario:", error);
            }
        }
    }, []);
    useImperativeHandle(ref, () => ({
        getFormData: () => detalleAsignacion,  
    }));
    const firmaAsigno = (firma)=>{
        setDetalleAsignacion(prevData => ({
            ...prevData,
            firma_asigno: firma,
        }));
    }
    const firmaRecive = (firma)=>{
        setDetalleAsignacion(prevData => ({
            ...prevData,
            firma: firma,
        }));
    }
    const cambioUsuarioRecibe = (usuario_recibe) => {
        setDetalleAsignacion(prevData => ({
            ...prevData,
            usuario_recibe: usuario_recibe,
        }));
    }
    const cambioUsuarioEntrega = (usuario_entrega) => {
        setDetalleAsignacion(prevData => ({
            ...prevData,
            usuario_entrega: usuario_entrega,
        }));
    }
    const cambioObservacion = (observacion_data) =>{
        setDetalleAsignacion(prevData =>({
            ...prevData,
            observacion: observacion_data
        }))
    } 



    return(

        <div className="md:p-4 p-6 text-left md:grid md:grid-cols-2 md:gap-4 flex flex-col gap-2">
            <div className="mb-4 ">
                <label className=" text-gray-700 mb-2">Recibe Equipo</label>
                <SelectUsuario id='UsuarioRecibe' onSelectUsuario={cambioUsuarioRecibe}/>
                
            </div>
            <div className="mb-4 ">
                <label className=" text-gray-700 mb-2">Entrega Equipo</label>
                <SelectUsuario id='UsuarioEntrega' onSelectUsuario={cambioUsuarioEntrega} selectedUsuario={usurio} disable={false}/>

            </div>
            <div className="mb-4 ">
                <label className=" text-gray-700 mb-2">Firma Recibe</label>
                <CamporFirma ref={refFirmaRecibe} firmaCambia={firmaRecive}/>

            </div>
            <div className="mb-4 ">
                <label className=" text-gray-700 mb-2">Firma Entrega</label>
                <CamporFirma ref={refFirmaEntrega} firmaCambia={firmaAsigno}/>

            </div>
            <div className="mb-4 ">
                <label className=" text-gray-700 mb-2">Observacion</label>
                <textarea className='block w-full border h-[100px]' onChange={e => cambioObservacion(e.target.value)} ></textarea>

            </div>
        </div>
    );
})
EquiposAsignacion.displayName = 'FormDetalleAsignacion';
export default EquiposAsignacion;