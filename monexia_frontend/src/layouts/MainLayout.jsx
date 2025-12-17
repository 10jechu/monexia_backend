import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Wallet, TrendingDown, 
  AlertCircle, Target, Users, History, LogOut 
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20}/> },
    { name: 'Ingresos', path: '/ingresos', icon: <Wallet size={20} className="text-green-400"/> },
    { name: 'Gastos Fijos', path: '/gastos', icon: <TrendingDown size={20} className="text-rose-400"/> },
    { name: 'Deudas', path: '/deudas', icon: <AlertCircle size={20} className="text-orange-400"/> },
    { name: 'Metas Ahorro', path: '/metas', icon: <Target size={20} className="text-cyan-400"/> },
    { name: 'Cadenas', path: '/cadenas', icon: <Users size={20} className="text-purple-400"/> },
    { name: 'Movimientos', path: '/movimientos', icon: <History size={20}/> },
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200">
      <aside className="w-64 bg-[#1e293b] border-r border-blue-500/10 p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-cyan-400 mb-10 italic">MONEXIA</h1>
        <nav className="flex-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-slate-700/50 hover:text-cyan-400 transition-all mb-2"
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
        <button 
          onClick={() => { localStorage.clear(); navigate('/login'); }}
          className="flex items-center space-x-3 text-rose-400 p-3 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <LogOut size={20}/>
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;