import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Importación de Páginas
import HomePage from './pages/Home/HomePage'; // La nueva portada
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register'; // El nuevo registro
import Dashboard from './pages/Dashboard/Dashboard';
import IngresoPage from './pages/Ingreso/IngresoPage';
import GastoFijoPage from './pages/GastoFijo/GastoFijoPage';
import DeudaPage from './pages/Deuda/DeudaPage';
import MetaAhorroPage from './pages/MetaAhorro/MetaAhorroPage';
import CadenaPage from './pages/Cadena/CadenaPage';
import MovimientoPage from './pages/Movimiento/MovimientoPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* RUTAS PÚBLICAS (Sin menú lateral) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* RUTAS PRIVADAS (Dentro del MainLayout con menú) */}
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/ingresos" element={<MainLayout><IngresoPage /></MainLayout>} />
        <Route path="/gastos" element={<MainLayout><GastoFijoPage /></MainLayout>} />
        <Route path="/deudas" element={<MainLayout><DeudaPage /></MainLayout>} />
        <Route path="/metas" element={<MainLayout><MetaAhorroPage /></MainLayout>} />
        <Route path="/cadenas" element={<MainLayout><CadenaPage /></MainLayout>} />
        <Route path="/movimientos" element={<MainLayout><MovimientoPage /></MainLayout>} />
        
        {/* Redirección por si escriben una ruta que no existe */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;