// src/app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/inputs';
import API_URL from '@/config/apiConfig';

export default function LoginPage() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    

    const validarLogIn = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario, password }),
            });

            const data = await response.json();

            if (response.ok) {
                
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));


                router.push('/admin/dashboard'); 
               
            } else {
                setError(data.message || 'Error en el login. Inténtalo de nuevo.');
            }
        } catch (err) {
            setError('No se pudo conectar al servidor. Inténtalo más tarde.');
        }
    };

    return (
        // ... (resto del código de tu formulario de login) ...
        <div className=' h-screen w-screen flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-blue-400 to-blue-900'>
            <div className='bg-white rounded-2xl p-10 w-auto md:w-[450px]'>
                <div className='text-center p-4 text-black'>
                    <h1 className='text-xl font-bold'>INVENTARIO TIC</h1>                    
                </div>
                
                <form onSubmit={validarLogIn}>
                    <Input                        
                        id="usuario"
                        name="usuario"
                        type="text"
                        placeholder="Usuario:"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
                    />

                    {/* Input para Contraseña */}
                    <Input                        
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Contraseña: "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <button 
                        className='w-full font-bold border-[1px] p-2 rounded-2xl border-[var(--bg-principal)] text-[var(--bg-principal)] hover:text-white hover:bg-[var(--bg-principal)]' type="submit"
                    >
                        Iniciar Sesión
                    </button>
                </form>
            </div>           
        </div>
    );
}