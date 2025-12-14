'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCamera, FaUpload, FaTrashAlt, FaPlayCircle, FaStopCircle, FaPlusCircle } from "react-icons/fa";
import SelectEquipo from '../../../../components/imputs/equipos'

export default function EquiposAsignacion({ equipoData, setSelectedEquipos,elimiarEquios }) {


    const agregarequipo = useCallback((event)=>{
        if(!event){
            console.log('vacio')
        }else setSelectedEquipos(event)

    },[setSelectedEquipos])

    return(
    <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Equipos</h2>
        <div className="mb-6">
            {/* Botón para abrir el modal del scanner */}
            <SelectEquipo onSelectEquipo={agregarequipo}/>

        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Lista de Equipos por asignar ({equipoData.length})</h3>
        {equipoData.length === 0 ? (
                <p className="text-center text-gray-500 mb-6">No se han añadido vehículos aún.</p>
            ) : (
                <div>
                    <table className="w-full leading-normal md:min-w-full">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Número
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tipo de Equipo
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Marbete
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Eliminar
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipoData.map((equipo,i)=>(
                                <tr key={equipo.cod_equipo} className="hover:bg-gray-50">
                                    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                                        {i+1}
                                    </td>
                                    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                                        {equipo.tipo_equipo}
                                    </td>
                                    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                                        {equipo.marbete}
                                    </td>
                                    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                                        {equipo.estado}
                                    </td>
                                    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm text-center">
                                        <button
                                        type="button"
                                            onClick={() => elimiarEquios(equipo.cod_equipo)}
                                            className="text-red-600 hover:text-red-800 font-medium ">
                                            <FaTrashAlt className="inline-block " />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                
                </div>
            )}
    </div>
        
    );

}