// src/app/(admin)/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PiCornersOutBold } from 'react-icons/pi';
import GraficaBarra from '../../components/graficas/graf_barra';
import GraficaPie from '../../components/graficas/graf_pie';
import API_URL from '@/config/apiConfig';

export default function AdminDashboardPage() {
    const [user, setUser] = useState(null);
    const router = useRouter();
    const[graf1,setGraf1] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
            router.replace('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
        
            setUser(parsedUser);
        } catch (error) {
        console.error('Error al parsear JSON:', error);
        }

    }, [router]);
   

        useEffect(() => {
        const fetchModelo = async () => {
            try {
                const response = await fetch(`${API_URL}/equipos/conteoarea`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setGraf1(data);
            } catch (err) {
                
                console.error("Error fetching tipos de vehículo:", err);
            } 
        };

        fetchModelo();
    }, []);

    


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
    };

   if (!user) {
        return <p className="text-black">Cargando datos del usuario...</p>;
    }
   if (!graf1) {
        return <p className="text-black">Cargando datos ...</p>;
    }
 
    return (
        <div className='text-black flex flex-col  items-center h-full p-3'>
            <div className=' bg-white rounded-2xl p-4 items-center w-[95%] text-center mb-4'>
                <div className='mb-3'>
                    <h2 className='font-bold text-2xl'>Resumen General</h2>
                </div>
                <div className='flex justify-around items-center'>{/*informacion rapida */}
                    <div className='card bg-[var(--bg-principal)] rounded-2xl p-4 text-white font-bold'>
                        <p>Total de Equipos: 90</p>
                    </div>
                    <div className='card bg-[var(--bg-principal)] rounded-2xl p-4 text-white font-bold'>
                        <p>Equipos Asignados: 60</p>
                    </div>
                    <div className='card bg-[var(--bg-principal)] rounded-2xl p-4 text-white font-bold'>
                        <p>Equipos Disponibles: 10</p>
                    </div>
                    <div className='card bg-[var(--bg-principal)] rounded-2xl p-4 text-white font-bold'>
                        <p>Equipos en Descarte: 20</p>
                    </div>
                </div>
            </div>
            <div className=' bg-white rounded-2xl p-4 items-center w-[95%] text-center mb-4'>
                <div className='mb-3'>
                    <h2 className='font-bold text-2xl'>Visualización Detallada</h2>
                </div>
                <div className='flex justify-around items-center'>{/*informacion rapida */}
                    <div className='box-border'>
                      <GraficaBarra  data={graf1}
                        // ¡IMPORTANTE! Ajusta estas claves según la estructura de tu JSON
                        // Si tu JSON es: [{ "descripcion": "Laptop", "cantidad": 50 }]
                        xAxisDataKey="sub_area"
                        barDataKey="cantidad"
                        barName="Cantidad de Equipos"
                        title="Cantidad de Usuario por area"/>
                    </div>
                    <GraficaPie data={graf1}
                        // ¡IMPORTANTE! Ajusta estas claves según la estructura de tu JSON
                        // Si tu JSON es: [{ "descripcion": "Laptop", "cantidad": 50 }]
                        xAxisDataKey="sub_area"
                        barDataKey="cantidad"
                        barName="Cantidad de Equipos"
                        title="Conteo de Equipos por Tipo/Área"/>
                </div>
                
            </div>
            
        </div>
    );
}