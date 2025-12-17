import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Wallet, Calendar, Tag } from 'lucide-react';

const IngresoPage = () => {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    monto: '', 
    fuente: '', // Este es el nombre en el estado del formulario
    fecha: new Date().toISOString().split('T')[0] 
  });

  // 1. Cargar datos al iniciar
  useEffect(() => {
    fetchIngresos();
  }, []);

  const fetchIngresos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ingresos/'); 
      setIngresos(res.data);
    } catch (err) {
      console.error("Error cargando ingresos", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Guardar nuevo registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ajuste según tu modelo de SQLAlchemy: enviamos 'descripcion'
      await api.post('/ingresos/', { 
        monto: parseFloat(form.monto),
        descripcion: form.fuente, // Mapeo de fuente -> descripcion
        fecha: form.fecha 
      });

      // Limpiar formulario y recargar lista
      setForm({ monto: '', fuente: '', fecha: new Date().toISOString().split('T')[0] });
      fetchIngresos(); 
      alert("¡Ingreso guardado correctamente!");
    } catch (err) {
      console.error("Error al guardar:", err.response?.data);
      alert("Error al guardar. Revisa la consola para más detalles.");
    }
  };

  // 3. Eliminar registro
  const deleteIngreso = async (id) => {
    if (window.confirm("¿Deseas eliminar este registro?")) {
      try {
        await api.delete(`/ingresos/${id}`);
        fetchIngresos();
      } catch (err) {
        alert("No se pudo eliminar el registro.");
      }
    }
  };

  // Formateador de fecha para la tabla
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "Sin fecha";
    return fechaStr.split('T')[0];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Wallet className="text-green-400" size={32} /> Gestión de Ingresos
        </h2>
      </div>

      {/* Formulario de Entrada */}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-2xl">
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase font-bold px-1">Descripción</label>
          <input 
            type="text" placeholder="Ej. Sueldo Mamá"
            className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-green-400 outline-none transition-all"
            value={form.fuente} 
            onChange={e => setForm({...form, fuente: e.target.value})} 
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase font-bold px-1">Monto ($)</label>
          <input 
            type="number" step="0.01" placeholder="0.00"
            className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-green-400 outline-none transition-all"
            value={form.monto} 
            onChange={e => setForm({...form, monto: e.target.value})} 
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase font-bold px-1">Fecha</label>
          <input 
            type="date"
            className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-green-400 outline-none transition-all"
            value={form.fecha} 
            onChange={e => setForm({...form, fecha: e.target.value})}
          />
        </div>
        <button type="submit" className="bg-green-500 hover:bg-green-400 text-[#0f172a] font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95">
          <Plus size={20} /> Registrar
        </button>
      </form>

      {/* Tabla de Datos */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2d3a4f] text-slate-300 text-sm uppercase">
              <tr>
                <th className="p-4 font-semibold">Concepto</th>
                <th className="p-4 font-semibold text-center">Monto</th>
                <th className="p-4 font-semibold text-center">Fecha</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-slate-300">
              {ingresos.map((ing) => (
                <tr key={ing.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-green-500"/> 
                      <span className="font-medium">{ing.descripcion || "Sin descripción"}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-green-400 text-center">
                    ${Number(ing.monto).toLocaleString('es-CO')}
                  </td>
                  <td className="p-4 text-sm text-slate-400 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar size={14}/> {formatFecha(ing.fecha)}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => deleteIngreso(ing.id)} 
                      className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {ingresos.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-500 italic">
                    No hay ingresos registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IngresoPage;