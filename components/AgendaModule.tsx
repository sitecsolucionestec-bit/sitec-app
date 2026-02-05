
import React, { useState } from 'react';
import { Plus, Clock, MapPin, Calendar as CalIcon } from 'lucide-react';
import { AppState, VisitStatus, Visit } from '../types';

interface AgendaModuleProps {
  data: AppState;
  setData: React.Dispatch<React.SetStateAction<AppState>>;
}

const AgendaModule: React.FC<AgendaModuleProps> = ({ data, setData }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newVisit, setNewVisit] = useState<Partial<Visit>>({ date: '', time: '', description: '', clientId: '', technicianId: 't1', status: VisitStatus.PENDING });

  const handleSave = () => {
    if (!newVisit.clientId || !newVisit.date) return;
    const client = data.clients.find(c => c.id === newVisit.clientId);
    const v: Visit = { 
      ...newVisit as Visit, 
      id: `VIS-${Date.now().toString().slice(-4)}`, 
      address: client?.address || '' 
    };
    setData({ ...data, visits: [v, ...data.visits] });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agenda de Visitas</h2>
        <button onClick={() => setIsFormOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl font-bold flex items-center space-x-2 transition-colors">
          <Plus size={20} /> <span>Agendar Visita</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.visits.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 italic">No hay visitas programadas</div>
        ) : data.visits.map(v => (
          <div key={v.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-orange-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg text-slate-900">{data.clients.find(c => c.id === v.clientId)?.name}</h4>
                <p className="text-gray-600 mt-1">{v.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                v.status === VisitStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
              }`}>
                {v.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mt-4 border-t pt-4">
              <span className="flex items-center"><CalIcon size={14} className="mr-2 text-orange-500"/> {v.date}</span>
              <span className="flex items-center"><Clock size={14} className="mr-2 text-orange-500"/> {v.time}</span>
              <span className="flex items-center col-span-2 mt-1"><MapPin size={14} className="mr-2 text-orange-500"/> {v.address}</span>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Programar Visita</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" onChange={e => setNewVisit({...newVisit, clientId: e.target.value})}>
                <option value="">Seleccionar Cliente</option>
                {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input type="date" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" onChange={e => setNewVisit({...newVisit, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <input type="time" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" onChange={e => setNewVisit({...newVisit, time: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Trabajo</label>
              <textarea className="w-full border border-gray-300 p-3 rounded-xl h-24 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="¿Qué se realizará en la visita?" onChange={e => setNewVisit({...newVisit, description: e.target.value})} />
            </div>
            <div className="flex space-x-3 pt-4">
               <button onClick={() => setIsFormOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200">Cancelar</button>
               <button onClick={handleSave} className="flex-2 bg-orange-500 text-white py-3 px-8 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-100">Agendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaModule;
