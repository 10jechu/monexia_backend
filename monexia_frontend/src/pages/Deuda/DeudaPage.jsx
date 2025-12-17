import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, AlertCircle, Landmark, Receipt, Percent } from 'lucide-react';

const DeudasPage = () => {
  const [deudas, setDeudas] = useState([]);
  const [form, setForm] = useState({ 
    nombre: '', 
    monto: '', 
    tasa_interes: '2.0', 
    fecha_limite: '' 
  });

  const fetchDeudas = async () => {
    try {
      const res = await api.get('/deudas/');
      setDeudas(res.data);
    } catch (err) {
      console.error("Error al cargar deudas", err);
    }
  };

  useEffect(() => { fetchDeudas(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Limpieza de datos para evitar Error 422
      const tasaLimpia = form.tasa_interes.toString().replace(',', '.');
      const montoNum = parseFloat(form.monto);

      const payload = { 
        nombre: form.nombre,
        monto_total: montoNum,
        monto_pendiente: montoNum, // Inicialmente lo pendiente es el total
        tasa_interes: parseFloat(tasaLimpia),
        tipo_tasa: "mensual",
        fecha_limite: form.fecha_limite ? new Date(form.fecha_limite).toISOString() : null 
      };

      await api.post('/deudas/', payload);
      setForm({ nombre: '', monto: '', tasa_interes: '2.0', fecha_limite: '' });
      fetchDeudas();
      alert("¡Deuda registrada con éxito!");
    } catch (err) { 
      alert("Error: Revisa que la tasa sea un número válido (ej: 2.1)"); 
    }
  };

  const registrarAbono = async (deudaId) => {
    const monto = prompt("¿Cuánto vas a abonar hoy?");
    if (!monto || isNaN(monto)) return;

    try {
      await api.post('/pagos-deuda/', {
        deuda_id: deudaId,
        monto_pago: parseFloat(monto),
        fecha_pago: new Date().toISOString()
      });
      alert("Abono registrado. ¡El saldo ha bajado!");
      fetchDeudas();
    } catch (err) {
      alert("Error al registrar abono");
    }
  };

  const deleteDeuda = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta deuda?")) {
      try {
        await api.delete(`/deudas/${id}`);
        fetchDeudas();
      } catch (err) { alert("Error al eliminar"); }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 text-white">
      <header className="flex items-center gap-3">
        <AlertCircle className="text-amber-400" size={32} />
        <h2 className="text-3xl font-bold">Simulador de Deudas</h2>
      </header>

      {/* Formulario de Registro */}
      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-4 items-end shadow-lg">
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Nombre / Banco</label>
          <input type="text" className="w-full bg-slate-900 border border-slate-600 p-2 rounded text-sm focus:border-amber-400 outline-none"
            value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Monto Inicial</label>
          <input type="number" className="w-full bg-slate-900 border border-slate-600 p-2 rounded text-sm focus:border-amber-400 outline-none"
            value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Interés Mensual %</label>
          <input type="text" className="w-full bg-slate-900 border border-slate-600 p-2 rounded text-sm focus:border-amber-400 outline-none"
            value={form.tasa_interes} onChange={e => setForm({...form, tasa_interes: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Fecha Límite</label>
          <input type="date" className="w-full bg-slate-900 border border-slate-600 p-2 rounded text-sm focus:border-amber-400 outline-none"
            value={form.fecha_limite} onChange={e => setForm({...form, fecha_limite: e.target.value})} required />
        </div>
        <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2 rounded flex justify-center items-center gap-2 transition-all active:scale-95">
          <Plus size={18} /> Crear
        </button>
      </form>

      {/* Tabla de Deudas */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <table className="w-full">
          <thead className="bg-slate-700/50 text-slate-300 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 text-left">Detalles</th>
              <th className="p-4 text-center">Estado de Pago</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {deudas.map((d) => {
              const interesProx = d.monto_pendiente * (d.tasa_interes / 100);
              const progreso = ((d.monto_total - d.monto_pendiente) / d.monto_total) * 100;
              
              return (
                <tr key={d.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold flex items-center gap-2"><Landmark size={14} className="text-amber-400"/> {d.nombre}</div>
                    <div className="text-[10px] text-amber-500 font-bold mt-1">
                      <Percent size={10} className="inline mr-1"/>
                      INTERÉS MENSUAL: ${interesProx.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-between text-[10px] mb-1 font-mono">
                      <span className="text-amber-400">PAGADO: {progreso.toFixed(1)}%</span>
                      <span className="text-slate-400">SALDO: ${Number(d.monto_pendiente).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full border border-slate-700">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(progreso, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => registrarAbono(d.id)} className="bg-green-500/10 text-green-500 p-2 rounded-lg hover:bg-green-500 hover:text-white transition-all shadow-sm" title="Abonar">
                        <Receipt size={18}/>
                      </button>
                      <button onClick={() => deleteDeuda(d.id)} className="bg-rose-500/10 text-rose-500 p-2 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm">
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
          <div className="p-10 text-center text-slate-500 italic">No hay deudas registradas. ¡Empieza creando una!</div>
        )}
      </div>
    </div>
  );
};

export default DeudasPage;