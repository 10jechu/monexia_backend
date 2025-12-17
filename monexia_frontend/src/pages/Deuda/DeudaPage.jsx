import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Plus, Trash2, AlertCircle, Calendar, 
  Landmark, Receipt, Edit3, Percent 
} from 'lucide-react';

const DeudasPage = () => {
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    nombre: '', 
    monto: '', 
    tasa_interes: '2.0', // Valor por defecto
    fecha_limite: '' 
  });

  const fetchDeudas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/deudas/');
      setDeudas(res.data);
    } catch (err) {
      console.error("Error al cargar deudas", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDeudas(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviamos los campos exactos que el Schema de FastAPI espera
      await api.post('/deudas/', { 
        nombre: form.nombre,
        monto_total: parseFloat(form.monto),
        tasa_interes: parseFloat(form.tasa_interes),
        tipo_tasa: "mensual",
        fecha_limite: form.fecha_limite 
      });

      setForm({ nombre: '', monto: '', tasa_interes: '2.0', fecha_limite: '' });
      fetchDeudas();
      alert("¡Deuda registrada con éxito!");
    } catch (err) { 
      console.error(err.response?.data);
      alert("Error al registrar: Revisa que todos los campos sean válidos."); 
    }
  };

  const registrarAbono = async (deudaId) => {
    const monto = prompt("¿Cuánto deseas abonar a esta deuda?");
    if (!monto || isNaN(monto)) return;

    try {
      await api.post('/pagos-deuda/', {
        deuda_id: deudaId,
        monto_pago: parseFloat(monto),
        fecha_pago: new Date().toISOString()
      });
      alert("¡Abono registrado! El sistema calculó intereses y actualizó el saldo.");
      fetchDeudas();
    } catch (err) {
      alert(err.response?.data?.detail || "Error al registrar abono");
    }
  };

  const deleteDeuda = async (id) => {
    if (window.confirm("¿Eliminar este registro de deuda?")) {
      try {
        await api.delete(`/deudas/${id}`);
        fetchDeudas();
      } catch (err) { alert("Error al eliminar"); }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 p-4">
      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
        <AlertCircle className="text-amber-400" size={32} /> Simulador de Deudas
      </h2>

      {/* Formulario de Registro */}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-4 items-end shadow-xl">
        <div className="md:col-span-1">
          <label className="text-[10px] text-slate-400 uppercase font-bold mb-2 block tracking-wider">Acreedor</label>
          <input type="text" placeholder="Ej. Banco" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-amber-400 outline-none text-sm"
            value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold mb-2 block tracking-wider">Monto Inicial</label>
          <input type="number" placeholder="0.00" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-amber-400 outline-none text-sm"
            value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold mb-2 block tracking-wider">Interés Mensual %</label>
          <input type="number" step="0.1" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-amber-400 outline-none text-sm"
            value={form.tasa_interes} onChange={e => setForm({...form, tasa_interes: e.target.value})} required />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold mb-2 block tracking-wider">Vencimiento</label>
          <input type="date" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-amber-400 outline-none text-sm"
            value={form.fecha_limite} onChange={e => setForm({...form, fecha_limite: e.target.value})} required />
        </div>
        <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-[#0f172a] font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 shadow-lg transition-all active:scale-95">
          <Plus size={20} /> Crear
        </button>
      </form>

      {/* Listado de Deudas */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#2d3a4f] text-slate-300 text-[11px] uppercase tracking-widest">
            <tr>
              <th className="p-4">Información Deuda</th>
              <th className="p-4 text-center">Progreso de Pago</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-slate-300">
            {deudas.map((d) => {
              const interesMensual = d.monto_pendiente * (d.tasa_interes / 100);
              const porcentajePagado = ((d.monto_total - d.monto_pendiente) / d.monto_total) * 100;

              return (
                <tr key={d.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Landmark size={16} className="text-amber-400"/>
                      <span className="font-bold text-white uppercase">{d.nombre}</span>
                    </div>
                    <div className="text-[10px] text-amber-500 font-bold mt-1 flex items-center gap-1">
                      <Percent size={10}/> INTERÉS ESTIMADO: ${interesMensual.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-between text-[10px] mb-1 font-bold">
                      <span className="text-amber-400">PAGADO: {porcentajePagado.toFixed(1)}%</span>
                      <span className="text-slate-400">SALDO: ${Number(d.monto_pendiente).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-700" 
                        style={{ width: `${porcentajePagado}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => registrarAbono(d.id)} 
                        className="bg-green-500/10 text-green-500 p-2 rounded-lg hover:bg-green-500 hover:text-white transition-all shadow-sm"
                        title="Registrar Abono"
                      >
                        <Receipt size={18}/>
                      </button>
                      <button 
                        onClick={() => deleteDeuda(d.id)} 
                        className="bg-rose-500/10 text-rose-500 p-2 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {deudas.length === 0 && (
          <div className="p-10 text-center text-slate-500 italic text-sm">No hay deudas registradas.</div>
        )}
      </div>
    </div>
  );
};

export default DeudasPage;