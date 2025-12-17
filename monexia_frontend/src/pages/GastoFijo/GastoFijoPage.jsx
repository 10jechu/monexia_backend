import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, TrendingDown, Calendar, CreditCard } from 'lucide-react';

const GastoFijoPage = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    monto: '', 
    nombre: '', 
    fecha_pago: new Date().toISOString().split('T')[0] 
  });

  // 1. CARGA DE DATOS (Asegura que los registros anteriores siempre aparezcan)
  const fetchGastos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gastos/'); 
      setGastos(res.data);
    } catch (err) {
      console.error("Error cargando gastos", err);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchGastos(); 
  }, []);

  // 2. GUARDAR (Manda los datos y refresca la lista completa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gastos/', { 
        ...form, 
        monto: parseFloat(form.monto) 
      });
      // Limpia el formulario
      setForm({ monto: '', nombre: '', fecha_pago: new Date().toISOString().split('T')[0] });
      // RECARGA TODO: Esto soluciona que desaparezcan los registros anteriores
      fetchGastos();
      alert("¡Gasto registrado con éxito!");
    } catch (err) { 
      alert("Error al guardar: Verifica tu sesión."); 
    }
  };

  // 3. ELIMINAR
  const deleteGasto = async (id) => {
    if (window.confirm("¿Eliminar este gasto?")) {
      try {
        await api.delete(`/gastos/${id}`);
        fetchGastos();
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  // Función para que la fecha no salga con "T00:00:00"
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "Sin fecha";
    return fechaStr.split('T')[0];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 p-4">
      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
        <TrendingDown className="text-rose-400" size={32} /> Gastos Mensuales
      </h2>

      {/* Formulario de registro */}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-xl">
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Servicio / Gasto</label>
          <input 
            type="text" placeholder="Ej. Arriendo" 
            className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-rose-400 outline-none transition-all"
            value={form.nombre} 
            onChange={e => setForm({...form, nombre: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Monto ($)</label>
          <input 
            type="number" 
            placeholder="0.00"
            className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-rose-400 outline-none transition-all"
            value={form.monto} 
            onChange={e => setForm({...form, monto: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Fecha de Pago</label>
          <input 
            type="date" 
            className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-rose-400 outline-none transition-all"
            value={form.fecha_pago} 
            onChange={e => setForm({...form, fecha_pago: e.target.value})} 
          />
        </div>
        <button type="submit" className="bg-rose-500 hover:bg-rose-400 text-white font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 shadow-lg shadow-rose-500/20 transition-all active:scale-95">
          <Plus size={20} /> Registrar
        </button>
      </form>

      {/* Tabla de resultados */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#2d3a4f] text-slate-300 text-sm uppercase">
              <tr>
                <th className="p-4 font-semibold">Gasto</th>
                <th className="p-4 text-center font-semibold">Monto</th>
                <th className="p-4 text-center font-semibold">Fecha</th>
                <th className="p-4 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-slate-300">
              {gastos.map((g) => (
                <tr key={g.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 flex items-center gap-2 uppercase text-sm tracking-tighter">
                    <CreditCard size={14} className="text-rose-400"/> 
                    {/* SI NO SALE EL NOMBRE, CAMBIA 'nombre' POR 'fuente' O 'concepto' */}
                    {g.nombre || "Sin nombre"}
                  </td>
                  <td className="p-4 font-bold text-rose-400 text-center">
                    -${Number(g.monto).toLocaleString('es-CO')}
                  </td>
                  <td className="p-4 text-sm text-slate-400 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Calendar size={14}/> {formatFecha(g.fecha_pago)}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => deleteGasto(g.id)} 
                      className="text-slate-500 hover:text-rose-500 p-2 transition-colors rounded-lg hover:bg-rose-500/10"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
              {gastos.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-500 italic">
                    No hay gastos fijos registrados.
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

export default GastoFijoPage;