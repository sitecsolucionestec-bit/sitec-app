
import React, { useState } from 'react';
import { Plus, Users, MapPin, Phone, Mail, X, Edit, Trash2 } from 'lucide-react';
import { AppState, Client } from '../types';

interface ClientsModuleProps {
  data: AppState;
  setData: React.Dispatch<React.SetStateAction<AppState>>;
}

const ClientsModule: React.FC<ClientsModuleProps> = ({ data, setData }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formState, setFormState] = useState<Partial<Client>>({ name: '', nit: '', address: '', phone: '', email: '', contactPerson: '' });

  const handleOpenForm = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormState(client);
    } else {
      setEditingClient(null);
      setFormState({ name: '', nit: '', address: '', phone: '', email: '', contactPerson: '' });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formState.name || !formState.nit) return;
    
    if (editingClient) {
      const updatedClients = data.clients.map(c => 
        c.id === editingClient.id ? { ...formState as Client } : c
      );
      setData({ ...data, clients: updatedClients });
    } else {
      const newClient: Client = { 
        ...formState as Client, 
        id: Date.now().toString()
      };
      setData({ ...data, clients: [newClient, ...data.clients] });
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este cliente de la base de datos de SITEC?')) {
      setData({ ...data, clients: data.clients.filter(c => c.id !== id) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión de Clientes</h2>
          <p className="text-sm text-gray-500">Base de datos centralizada de beneficiarios SITEC.</p>
        </div>
        <button onClick={() => handleOpenForm()} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-orange-100 hover:scale-105 active:scale-95">
          <Plus size={20} /> <span>Añadir Cliente</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.clients.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative">
            <div className="absolute top-6 right-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenForm(c)} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm" title="Editar">
                <Edit size={16}/>
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Eliminar">
                <Trash2 size={16}/>
              </button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black text-2xl group-hover:from-orange-500 group-hover:to-orange-600 group-hover:text-white transition-all transform group-hover:rotate-3 shadow-inner">
                {c.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-orange-600 transition-colors">{c.name}</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">NIT: {c.nit}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <div className="flex items-start">
                <MapPin size={16} className="mr-3 text-orange-500 flex-shrink-0 mt-0.5"/>
                <p className="text-sm text-slate-600 font-medium">{c.address}</p>
              </div>
              <div className="flex items-center">
                <Phone size={16} className="mr-3 text-orange-500 flex-shrink-0"/>
                <p className="text-sm text-slate-600 font-medium">{c.phone}</p>
              </div>
              <div className="flex items-center">
                <Mail size={16} className="mr-3 text-orange-500 flex-shrink-0"/>
                <p className="text-sm text-slate-600 font-medium truncate">{c.email}</p>
              </div>
              
              {c.contactPerson && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Contacto Directo</p>
                  <p className="text-sm text-slate-700 font-bold italic">{c.contactPerson}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 space-y-6 shadow-2xl relative border border-white/20">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-8 right-8 p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X/></button>
            
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-100">
                <Users size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {editingClient ? 'Actualizar Cliente' : 'Nuevo Cliente SITEC'}
              </h3>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Razón Social</label>
                  <input className="w-full border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all bg-gray-50 font-bold text-slate-700" placeholder="Nombre empresa" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">NIT / CC</label>
                  <input className="w-full border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all bg-gray-50 font-bold text-slate-700" placeholder="900.000.000-0" value={formState.nit} onChange={e => setFormState({...formState, nit: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Dirección de Servicio</label>
                <input className="w-full border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all bg-gray-50 font-bold text-slate-700" placeholder="Av. Principal #12-34" value={formState.address} onChange={e => setFormState({...formState, address: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp / Tel</label>
                  <input className="w-full border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all bg-gray-50 font-bold text-slate-700" placeholder="300 000 0000" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Corporativo</label>
                  <input className="w-full border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all bg-gray-50 font-bold text-slate-700" placeholder="info@empresa.com" value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Encargado (Contacto)</label>
                <input className="w-full border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all bg-gray-50 font-bold text-slate-700 italic" placeholder="Ej: Ing. Juan David" value={formState.contactPerson} onChange={e => setFormState({...formState, contactPerson: e.target.value})} />
              </div>
            </div>
            
            <div className="flex space-x-4 pt-2">
              <button onClick={() => setIsFormOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all">Cancelar</button>
              <button onClick={handleSave} className="flex-[2] bg-orange-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 active:scale-95">
                {editingClient ? 'Actualizar Información' : 'Registrar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsModule;
