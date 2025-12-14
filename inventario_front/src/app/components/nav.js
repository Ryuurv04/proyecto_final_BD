// src/components/Sidebar.js
import Link from 'next/link';
// Importa los iconos necesarios, incluyendo los de usuario y logout
import { FaChartPie, FaUsers, FaCube, FaCalendarAlt, FaFileAlt, FaUserCircle, FaUsersCog } from 'react-icons/fa';
import { PiNutFill } from "react-icons/pi";
import { MdLogout } from 'react-icons/md';
import { GrHostMaintenance } from "react-icons/gr";

const iconMap = {
  ChartPieIcon: FaChartPie,
  UsersIcon: FaUsers,
  CubeIcon: FaCube,
  CalendarIcon: FaCalendarAlt,
  DocumentTextIcon: FaFileAlt,
  AjustIcon:PiNutFill ,
  UserAdd:FaUsersCog ,
  Mantenimiento:GrHostMaintenance,
  // Añade más mapeos de iconos según tus necesidades
};

// Recibe 'user', 'router', 'isOpen' y 'onClose' como props
const Sidebar = ({ navItems, currentPath, user, router, isOpen, onClose }) => {

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/login');
    onClose(); // Cierra el sidebar después de cerrar sesión, si estaba abierto
  };

  return (
    <aside className={`
      w-64 bg-white shadow-md p-6 flex flex-col h-screen fixed top-0 left-0 z-50
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} /* Controla la visibilidad en móvil */
      md:translate-x-0 /* Siempre visible en pantallas medianas y grandes */
      md:relative md:shadow-none /* En desktop, no es fixed ni tiene sombra a la izquierda */
    `}>
      {/* Sección superior del Sidebar con información del usuario */}
      <div className="flex flex-col items-center mb-8 pb-4 border-b border-gray-200">
        <FaUserCircle className="w-16 h-16 text-blue-600 mb-3" />
        <span className="text-xl font-semibold text-gray-800 mb-1">
          {user?.nombre} {user?.apellido}
        </span>
        

        {/* Botón de Cerrar Sesión movido al sidebar */}
        <button
          onClick={handleLogout}
          className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200"
          title="Cerrar Sesión"
        >
          <MdLogout className="w-5 h-5 mr-2" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 overflow-y-auto">
        <ul>
          {navItems.map((item) => {
            const IconComponent = iconMap[item.icon];
            const isActive = currentPath === item.href;
            return (
              <li key={item.name} className="mb-2">
                <Link
                  href={item.href}
                  onClick={onClose} // Cierra el sidebar al navegar en móvil
                  className={`
                    flex items-center p-3 rounded-lg transition-colors duration-200
                    ${isActive ? 'bg-[var(--bg-principal)] text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  {IconComponent && <IconComponent className="w-5 h-5 mr-3" />}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

     
    </aside>
  );
};

export default Sidebar;