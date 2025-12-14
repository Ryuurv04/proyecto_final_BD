// src/app/admin/layout.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../components/nav';
import { FaBars, FaTimes } from 'react-icons/fa'; 



export default function Admin({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú FAB
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Nuevo estado para la visibilidad del sidebar
  const [Loading, setLoading] = useState(false);

  useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            router.replace('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
       
        setUser(parsedUser);
    }, [router]);

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Cierra el sidebar automáticamente si la pantalla es grande
  // Opcional: Esto ayuda si el usuario redimensiona la ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint in Tailwind is 768px
        setIsSidebarOpen(false); // Asegura que el sidebar esté cerrado en móvil si redimensionan a desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const sidebarNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'ChartPieIcon' },
    { name: 'Asignaciones', href: '/admin/asignacion', icon: 'UserAdd' },
    { name: 'Inventario', href: '/admin/inventario', icon: 'CubeIcon' },
    { name: 'Mantenimiento', href: '/admin/mantenimiento', icon: 'Mantenimiento' },
   
  ];


  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Overlay para móviles cuando el sidebar está abierto */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar} // Cierra el sidebar al hacer clic fuera
        ></div>
      )}

      {/* Sidebar - ahora recibe el estado y la función para cerrarse */}
      <Sidebar
        navItems={sidebarNavItems}
        currentPath={pathname}
        user={user}
        router={router}
        isOpen={isSidebarOpen} // Pasa el estado de apertura
        onClose={toggleSidebar} // Pasa la función para cerrar el sidebar
      />

      <div className="flex-1 flex flex-col "> {/* md:ml-64 empuja el contenido cuando el sidebar está visible */}
        {/* Botón de hamburguesa para móvil */}
        <div className="md:hidden p-4 bg-white shadow-sm flex items-center justify-between sticky top-0 z-30">
          <button onClick={toggleSidebar} className="text-gray-700">
            {isSidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
          <span className="text-xl font-semibold text-gray-800">
            {/* Aquí puedes poner un título dinámico o el nombre de la app para móvil */}
            IVENTARIO TIC
          </span>
          {/* Espacio para alinear el título si no hay más elementos a la derecha */}
          <div className="w-6 h-6"></div> 
        </div>

        {/* Contenido principal de la página */}
        <main className="flex-1  overflow-auto">
          {children}
        </main>

      </div>
    </div>
  );
}