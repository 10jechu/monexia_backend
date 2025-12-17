import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Target, Plus, Trash2, PiggyBank } from 'lucide-react';

const MetasAhorroPage = () => {
  const [metas, setMetas] = useState([]);
  const [form, setForm] = useState({ nombre: '', objetivo: '', actual: 0 });

  const fetchMetas = async () => {
    try {
      const res = await api.get('/metas/');
      setMetas(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMetas(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/metas/', { 
        ...form, 
        objetivo: parseFloat(form.objetivo),
        actual: parseFloat(form.actual) 
      });
      setForm({ nombre: '', objetivo: '', actual: 0 });
      fetchMetas();
    } catch (err) { alert("Error al crear meta"); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
        <Target className="text-cyan-400" size={32} /> Metas de Ahorro
      </h2>

      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">¿Para qué ahorramos?</label>
          <input type="text" placeholder="Viaje, Nevera..." className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-cyan-400"
            value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Monto Objetivo ($)</label>
          <input type="number" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-cyan-400"
            value={form.objetivo} onChange={e => setForm({...form, objetivo: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Llevamos Ahorrado ($)</label>
          <input type="number" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-cyan-400"
            value={form.actual} onChange={e => setForm({...form, actual: e.target.value})} />
        </div>
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-[#0f172a] font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all">
          <Plus size={20} /> Crear Meta
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metas.map(meta => {
          const progreso = Math.min((meta.actual / meta.objetivo) * 100, 100);
          return (
            <div key={meta.id} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-500/10 p-3 rounded-xl"><PiggyBank className="text-cyan-400" /></div>
                  <h3 className="text-xl font-bold text-white uppercase">{meta.nombre}</h3>
                </div>
                <button onClick={async () => { await api.delete(`/metas/${meta.id}`); fetchMetas(); }} className="text-slate-500 hover:text-rose-500"><Trash2 size={18}/></button>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Progreso: {progreso.toFixed(1)}%</span>
                <span className="text-cyan-400 font-bold">${Number(meta.actual).toLocaleString()} / ${Number(meta.objetivo).toLocaleString()}</span>
              </div>
              
              <div className="w-full bg-[#0f172a] h-3 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full transition-all duration-1000" style={{ width: `${progreso}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetasAhorroPage;