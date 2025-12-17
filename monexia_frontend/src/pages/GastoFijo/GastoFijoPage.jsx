import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, TrendingDown, CreditCard, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GastoFijoPage = () => {
  const [gastos, setGastos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    nombre: '', 
    monto: '', 
    fecha_pago: new Date().toISOString().split('T')[0] 
  });
  const [editForm, setEditForm] = useState({ nombre: '', monto: '', fecha_pago: '' });

  // 1. Cargar Gastos (Ruta corregida a /gastos-fijos/)
  const fetchGastos = async () => {
    try {
      const res = await api.get('/gastos-fijos/');
      setGastos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando gastos", err);
    }
  };

  useEffect(() => { fetchGastos(); }, []);

  // 2. Crear Gasto
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gastos-fijos/', { 
        ...form, 
        monto: parseFloat(form.monto) 
      });
      setForm({ nombre: '', monto: '', fecha_pago: new Date().toISOString().split('T')[0] });
      fetchGastos();
    } catch (err) {
      alert("Error al guardar el gasto.");
    }
  };

  // 3. Iniciar Edición
  const startEdit = (g) => {
    setEditingId(g.id);
    setEditForm({ 
      nombre: g.nombre, 
      monto: g.monto, 
      fecha_pago: g.fecha_pago ? g.fecha_pago.split('T')[0] : '' 
    });
  };

  // 4. Guardar Edición (Ruta corregida)
  const saveEdit = async (id) => {
    try {
      await api.patch(`/gastos-fijos/${id}`, {
        ...editForm,
        monto: parseFloat(editForm.monto)
      });
      setEditingId(null);
      fetchGastos();
    } catch (err) {
      alert("Error al actualizar");
    }
  };

  // 5. Eliminar Gasto
  const deleteGasto = async (id) => {
    if (window.confirm("¿Eliminar este gasto fijo?")) {
      try {
        await api.delete(`/gastos-fijos/${id}`);
        fetchGastos();
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      {/* Encabezado con Animación */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <TrendingDown className="text-rose-500" size={32} /> Gastos Mensuales
          </h2>
          <p className="text-slate-400 text-sm italic">Gestiona tus responsabilidades fijas</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 px-6 py-3 rounded-2xl text-right">
          <p className="text-[10px] text-rose-300 font-bold uppercase tracking-widest">Total Mensual</p>
          <p className="text-2xl font-black text-rose-500">
            -${gastos.reduce((a, b) => a + Number(b.monto || 0), 0).toLocaleString('es-CO')}
          </p>
        </div>
      </motion.div>

      {/* Formulario de Registro (Estilo Ingresos: Verde Fluo) */}
      <motion.form 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={handleSubmit} 
        className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-xl"
      >
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-black mb-2 block tracking-wider">Servicio / Gasto</label>
          <input type="text" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-rose-500 transition-all"
            value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required placeholder="Ej: Arriendo" />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-black mb-2 block tracking-wider">Monto ($)</label>
          <input type="number" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-rose-500 transition-all"
            value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required placeholder="0.00" />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-black mb-2 block tracking-wider">Fecha de Pago</label>
          <input type="date" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-rose-500 transition-all"
            value={form.fecha_pago} onChange={e => setForm({...form, fecha_pago: e.target.value})} />
        </div>
        <button type="submit" className="bg-[#00e676] hover:bg-[#00c853] text-[#0f172a] font-black py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/20 uppercase text-xs tracking-widest">
          <Plus size={18} strokeWidth={3} /> Registrar
        </button>
      </motion.form>

      {/* Tabla de Gastos con Imperatividad */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-[#0f172a] text-[10px] uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="p-4 font-black">Gasto / Servicio</th>
              <th className="p-4 text-center font-black">Monto</th>
              <th className="p-4 text-center font-black">Fecha</th>
              <th className="p-4 text-center font-black">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            <AnimatePresence>
              {gastos.map((g) => (
                <motion.tr 
                  key={g.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {editingId === g.id ? (
                    <>
                      <td className="p-2"><input className="bg-slate-900 border border-rose-500 p-2 rounded w-full text-sm text-white" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})}/></td>
                      <td className="p-2"><input type="number" className="bg-slate-900 border border-rose-500 p-2 rounded w-full text-sm text-center text-white font-bold" value={editForm.monto} onChange={e => setEditForm({...editForm, monto: e.target.value})}/></td>
                      <td className="p-2"><input type="date" className="bg-slate-900 border border-rose-500 p-2 rounded w-full text-sm text-center text-white" value={editForm.fecha_pago} onChange={e => setEditForm({...editForm, fecha_pago: e.target.value})}/></td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => saveEdit(g.id)} className="bg-green-500/20 text-green-400 p-2 rounded-lg hover:bg-green-500/40 transition-all"><Check size={18}/></button>
                          <button onClick={() => setEditingId(null)} className="bg-rose-500/20 text-rose-400 p-2 rounded-lg hover:bg-rose-500/40 transition-all"><X size={18}/></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 flex items-center gap-3 uppercase text-[12px] font-bold tracking-tight">
                        <div className="bg-rose-500/10 p-2 rounded-lg group-hover:bg-rose-500/20 transition-colors">
                          <CreditCard size={14} className="text-rose-400"/>
                        </div>
                        {g.nombre}
                      </td>
                      <td className="p-4 font-black text-rose-500 text-center text-base">
                        -${Number(g.monto).toLocaleString('es-CO')}
                      </td>
                      <td className="p-4 text-[11px] font-black text-slate-500 text-center">
                        {g.fecha_pago?.split('T')[0]}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(g)} className="text-cyan-400 hover:bg-cyan-400/10 p-2 rounded-lg transition-all active:scale-90">
                            <Edit2 size={18}/>
                          </button>
                          <button onClick={() => deleteGasto(g.id)} className="text-slate-500 hover:text-rose-500 p-2 rounded-lg transition-all active:scale-90">
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {gastos.length === 0 && (
          <div className="p-12 text-center text-slate-500 italic text-sm">No hay gastos registrados en esta categoría.</div>
        )}
      </div>
    </div>
  );
};

export default GastoFijoPage;