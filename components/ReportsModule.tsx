
import React, { useState } from 'react';
import { Plus, Save, FileText, CheckCircle, FileCheck2, X } from 'lucide-react';
import { AppState, ExecutionReport, Quote } from '../types';
// Add formatCurrency to imports
import { generatePDF, formatCurrency } from '../utils';

interface ReportsModuleProps {
  data: AppState;
  setData: React.Dispatch<React.SetStateAction<AppState>>;
}

const ReportsModule: React.FC<ReportsModuleProps> = ({ data, setData }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activities, setActivities] = useState('');
  const [selectedVisit, setSelectedVisit] = useState('');
  const [selectedQuote, setSelectedQuote] = useState('');

  const approvedQuotes = data.quotes.filter(q => q.status === 'Approved');

  const handleSave = () => {
    if (!selectedVisit || !activities) {
      alert('Por favor seleccione una visita y describa las actividades.');
      return;
    }
    const visit = data.visits.find(v => v.id === selectedVisit);
    const report: ExecutionReport = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      visitId: selectedVisit,
      clientId: visit?.clientId || '',
      quoteId: selectedQuote || undefined,
      date: new Date().toISOString().split('T')[0],
      activities,
      equipmentIntervened: '',
      observations: '',
      warrantyMonths: 12
    };
    setData({ ...data, reports: [report, ...data.reports] });
    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setActivities('');
    setSelectedVisit('');
    setSelectedQuote('');
  };

  const getReportSummary = (r: ExecutionReport) => {
    const client = data.clients.find(c => c.id === r.clientId);
    const quote = data.quotes.find(q => q.id === r.quoteId);
    return `CLIENTE: ${client?.name}\nFECHA: ${r.date}\n${quote ? `COTIZACIÓN ASOCIADA: ${quote.id}\n` : ''}\nACTIVIDADES REALIZADAS:\n${r.activities}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reportes de Trabajo</h2>
          <p className="text-sm text-gray-500">Documentación técnica de servicios ejecutados en sitio.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95">
          <Plus size={20} /> <span>Nuevo Reporte</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.reports.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 italic">No hay reportes de ejecución registrados</div>
        ) : data.reports.map(r => (
          <div key={r.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:border-emerald-200 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors" />
            <div>
              <div className="flex items-center space-x-2 text-emerald-600 mb-3 relative z-10">
                <CheckCircle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Ejecución Completada</span>
              </div>
              <h4 className="font-bold text-slate-900 text-lg leading-tight mb-2">{data.clients.find(c => c.id === r.clientId)?.name}</h4>
              <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{r.activities}</p>
              
              {r.quoteId && (
                <div className="mt-3 flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg w-fit border border-orange-100">
                  <FileCheck2 size={12} className="mr-1"/> COTIZACIÓN: {r.quoteId}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-50">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{r.id} | {r.date}</span>
              <button onClick={() => generatePDF(`REPORTE DE SERVICIO ${r.id}`, getReportSummary(r))} className="text-emerald-600 font-bold text-xs flex items-center hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100">
                <FileText size={14} className="mr-1.5"/> VER PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center border-b border-gray-100 pb-5">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cerrar Orden de Servicio</h3>
                 <p className="text-xs text-gray-500 font-medium italic">Documente las actividades realizadas para el cliente.</p>
               </div>
               <button onClick={() => setIsFormOpen(false)} className="p-2.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X/></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vincular Visita Programada</label>
                <select className="w-full border border-gray-100 p-4 rounded-2xl outline-none bg-gray-50 font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" value={selectedVisit} onChange={e => setSelectedVisit(e.target.value)}>
                  <option value="">Seleccionar Visita...</option>
                  {data.visits.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.date} - {data.clients.find(c => c.id === v.clientId)?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cotización Relacionada (Opcional - Solo Aprobadas)</label>
                <select className="w-full border border-gray-100 p-4 rounded-2xl outline-none bg-orange-50/50 font-bold text-orange-700 border-orange-100 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all" value={selectedQuote} onChange={e => setSelectedQuote(e.target.value)}>
                  <option value="">Ninguna cotización asociada</option>
                  {approvedQuotes.map(q => (
                    <option key={q.id} value={q.id}>
                      {q.id} - {data.clients.find(c => c.id === q.clientId)?.name} ({formatCurrency(q.total)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Detallada de Actividades</label>
                <textarea className="w-full border border-gray-100 p-4 rounded-2xl h-40 outline-none bg-gray-50 font-medium text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none" placeholder="Relacione equipos instalados, configuraciones y soporte brindado..." value={activities} onChange={e => setActivities(e.target.value)} />
              </div>

              <div className="border-2 border-dashed border-slate-200 h-32 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 bg-slate-50/50 group hover:border-emerald-200 transition-colors">
                 <CheckCircle className="mb-2 opacity-20 group-hover:opacity-100 group-hover:text-emerald-500 transition-all" size={32}/>
                 <span className="text-[10px] uppercase font-black tracking-widest">Firma Digital del Cliente Requerida</span>
                 <span className="text-[9px] font-medium">(Habilitado en dispositivo móvil)</span>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
               <button onClick={() => setIsFormOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all">Descartar</button>
               <button onClick={handleSave} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]">
                 <Save size={20} className="inline mr-2 -mt-1"/> Finalizar y Guardar
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsModule;
