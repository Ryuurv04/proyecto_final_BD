'use client';
import React from 'react';
import { FaCircleInfo } from "react-icons/fa6";

const Tabla = ({ data, ocultarColumna = [] ,onclick}) => {

       // Generar encabezado dinámico desde las llaves de la primera fila
        const todasColumnas = Object.keys(data[0]);

        // Eliminar las primeras N columnas según el índice
        const columnasVisibles = todasColumnas.filter((_, index) => !ocultarColumna.includes(index));
        // Formatear encabezado
        const encabezado = columnasVisibles.map((key) => ({
            accessor: key,
            value: key.replace(/_/g, ' ').toUpperCase()
        }));
        
    return (
        <table className="w-full leading-normal md:min-w-full">
            <thead className='hidden md:table-header-group'>
                <tr >
                    {encabezado.map((e) => (
                        <th
                            key={e.accessor}
                            className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                            {e.value}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((product, i) => (
                    <tr key={i} className="md:hover:bg-gray-50 md:cursor-pointer  md:table-row flex flex-col border md:border-0 border-gray-200  mb-1 md:mb-0" onClick={()=>onclick(data[i])}>
                        {encabezado.map((e) => (
                            <td
                                key={e.accessor}
                                className="px-5 py-5 md:border-b border-gray-200 bg-white text-sm flex justify-between items-center md:table-cell"
                            >
                                <span className="font-semibold md:hidden block text-gray-600 ">{e.value}</span>
                                <span className="font-semibold  text-gray-600 ">{product[e.accessor]}</span>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Tabla;
