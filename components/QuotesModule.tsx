
import React, { useState } from 'react';
import { Plus, X, Download, MessageCircle, Trash2, CheckSquare, Square, ShoppingCart, Wrench, Settings, CheckCircle2, XCircle, Clock, Check } from 'lucide-react';
import { AppState, Quote, QuoteItem, ServiceType } from '../types';
import { formatCurrency, generateQuotePDF, shareWhatsApp, DEFAULT_QUOTE_OBSERVATIONS, DEFAULT_COMMERCIAL_CONDITIONS } from '../utils';

interface QuotesModuleProps {
  data: AppState;
  setData: React.Dispatch<React.SetStateAction<AppState>>;
}

const QuotesModule: React.FC<QuotesModuleProps> = ({ data, setData }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceType[]>([]);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [laborCost, setLaborCost] = useState<number>(0);
  const [newItem, setNewItem] = useState({ description: '', quantity: 1, unitPrice: 0 });

  const serviceOptions: {id: ServiceType, label: string, icon: any}[] = [
    { id: 'Venta', label: 'Venta de Equipos', icon: ShoppingCart },
    { id: 'Mantenimiento', label: 'Mantenimiento', icon: Wrench },
    { id: 'Instalación', label: 'Instalación', icon: Settings }
  ];

  const updateQuoteStatus = (id: string, newStatus: Quote['status']) => {
    const updatedQuotes = data.quotes.map(q => q.id === id ? { ...q, status: newStatus } : q);
    setData({ ...data, quotes: updatedQuotes });
  };

  const handleApproveQuote = (quote: Quote) => {
    // Buscar si ya existe una cotización aprobada para este mismo cliente
    const existingApproved = data.quotes.find(q => q.clientId === quote.clientId && q.status === 'Approved' && q.id !== quote.id);
    
    if (existingApproved) {
      const confirmReplacement = window.confirm(
        `El cliente ya tiene una cotización aprobada (${existingApproved.id}). ¿Desea reemplazarla por esta nueva cotización y marcar la anterior como enviada?`
      );
      
      if (!confirmReplacement) return;
      
      // Actualizar ambas cotizaciones: la vieja pasa a 'Sent' y la nueva a 'Approved'
      const updatedQuotes = data.quotes.map(q => {
        if (q.id === existingApproved.id) return { ...q, status: 'Sent' as const };
        if (q.id === quote.id) return { ...q, status: 'Approved' as const };
        return q;
      });
      setData({ ...data, quotes: updatedQuotes });
    } else {
      updateQuoteStatus(quote.id, 'Approved');
    }
  };

  const handleDeleteQuote = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta cotización?')) {
      setData({ ...data, quotes: data.quotes.filter(q => q.id !== id) });
    }
  };

  const toggleServiceType = (type: ServiceType) => {
    if (selectedServiceTypes.includes(type)) {
      setSelectedServiceTypes(selectedServiceTypes.filter(t => t !== type));
    } else {
      setSelectedServiceTypes([...selectedServiceTypes, type]);
    }
  };

  const handleAddItem = () => {
    if (!newItem.description) return;
    setItems([...items, { ...newItem, id: Date.now().toString() }]);
    setNewItem({ description: '', quantity: 1, unitPrice: 0 });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSaveQuote = () => {
    if (!selectedClient) {
      alert('Por favor seleccione un cliente.');
      return;
    }
    if (selectedServiceTypes.length === 0) {
      alert('Por favor marque al menos un tipo de servicio.');
      return;
    }
    
    const subtotalItems = items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);
    const subtotalGeneral = subtotalItems + laborCost;
    const iva = subtotalGeneral * 0.19;
    const total = subtotalGeneral + iva;

    const newQuote: Quote = {
      id: `COT-${data.quotes.length + 101}`,
      clientId: selectedClient,
      date: new Date().toISOString().split('T')[0],
      serviceTypes: selectedServiceTypes,
      items,
      laborCost,
      subtotalItems,
      subtotalGeneral,
      iva,
      total,
      status: 'Sent',
      observations: DEFAULT_QUOTE_OBSERVATIONS,
      commercialConditions: DEFAULT_COMMERCIAL_CONDITIONS
    };

    setData({ ...data, quotes: [newQuote, ...data.quotes] });
    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setItems([]);
    setLaborCost(0);
    setSelectedClient('');
    setSelectedServiceTypes([]);
  };

  const createQuoteText = (q: Quote) => {
    const client = data.clients.find(c => c.id === q.clientId);
    const services = q.serviceTypes?.join(', ') || 'Servicios Técnicos';
    return `SITEC - Cotización ${q.id}\nCliente: ${client?.name}\nServicios: ${services}\nTotal: ${formatCurrency(q.total)}\n¡Gracias por preferirnos!`;
  };

  const getStatusStyle = (status: Quote['status']) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cotizaciones</h2>
          <p className="text-sm text-gray-500">Gestione y genere propuestas comerciales para sus clientes.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-orange-100 hover:scale-105 active:scale-95">
          <Plus size={20} /> <span>Nueva Cotización</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[950px]">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">No.</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Servicios</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.quotes.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No hay cotizaciones registradas</td></tr>
            ) : data.quotes.map(q => (
              <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">{q.id}</td>
                <td className="px-6 py-4 text-slate-600 font-medium">{data.clients.find(c => c.id === q.clientId)?.name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {q.serviceTypes?.map(st => (
                      <span key={st} className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-[9px] font-extrabold uppercase tracking-widest border border-orange-100">{st}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(q.total)}</td>
                <td className="px-6 py-4">
                  <select 
                    value={q.status} 
                    disabled={q.status === 'Approved'}
                    onChange={(e) => updateQuoteStatus(q.id, e.target.value as any)}
                    className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer outline-none ${getStatusStyle(q.status)} ${q.status === 'Approved' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <option value="Draft">Borrador</option>
                    <option value="Sent">Enviada</option>
                    <option value="Approved">Aprobada</option>
                    <option value="Rejected">Rechazada</option>
                  </select>
                </td>
                <td className="px-6 py-4 flex space-x-1">
                  {q.status !== 'Approved' && (
                    <button 
                      onClick={() => handleApproveQuote(q)} 
                      className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                      title="Aprobar Cotización"
                    >
                      <Check size={18}/>
                    </button>
                  )}
                  <button onClick={() => generateQuotePDF(q, data.clients.find(c => c.id === q.clientId))} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors" title="Descargar PDF">
                    <Download size={18}/>
                  </button>
                  <button onClick={() => shareWhatsApp(createQuoteText(q))} className="p-2.5 hover:bg-emerald-50 rounded-xl text-emerald-500 transition-colors" title="Compartir WhatsApp">
                    <MessageCircle size={18}/>
                  </button>
                  {q.status !== 'Approved' && (
                    <button onClick={() => handleDeleteQuote(q.id)} className="p-2.5 hover:bg-red-50 text-red-400 rounded-xl transition-colors" title="Eliminar">
                      <Trash2 size={18}/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto border border-white/20">
             <div className="flex justify-between items-center border-b border-gray-100 pb-5">
               <div>
                 <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Nueva Propuesta Comercial</h3>
                 <p className="text-xs text-gray-500 font-medium">Configure los servicios y equipos para SITEC S.A.S.</p>
               </div>
               <button onClick={() => setIsFormOpen(false)} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={24}/></button>
             </div>
             
             <div className="space-y-6">
               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700 ml-1">Cliente Beneficiario</label>
                 <select className="w-full border border-gray-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all bg-gray-50/50 text-slate-700 font-medium" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
                   <option value="">Seleccione el cliente de la base de datos...</option>
                   {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>

               <div className="space-y-3">
                 <label className="block text-sm font-bold text-slate-700 ml-1">Marque los Servicios a Cotizar:</label>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {serviceOptions.map(option => (
                      <button 
                        key={option.id}
                        onClick={() => toggleServiceType(option.id)}
                        className={`group relative flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all ${
                          selectedServiceTypes.includes(option.id) 
                          ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${
                          selectedServiceTypes.includes(option.id) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <option.icon size={18}/>
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-bold leading-tight ${selectedServiceTypes.includes(option.id) ? 'text-orange-700' : 'text-slate-500'}`}>{option.label}</p>
                        </div>
                        <div className="absolute top-2 right-2">
                          {selectedServiceTypes.includes(option.id) ? <CheckSquare size={16} className="text-orange-500"/> : <Square size={16} className="text-gray-200"/>}
                        </div>
                      </button>
                    ))}
                 </div>
               </div>
             </div>

             <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
               <div className="flex justify-between items-center px-1">
                 <p className="text-sm font-bold text-slate-800 flex items-center">
                   <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                   Desglose de Equipos y Materiales
                 </p>
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Añadir a la tabla</span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                 <input className="md:col-span-6 border border-gray-200 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium text-slate-700" placeholder="Descripción del producto o equipo" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                 <input type="number" className="md:col-span-2 border border-gray-200 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none bg-white text-center font-bold" placeholder="Cant." value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: +e.target.value})} />
                 <input type="number" className="md:col-span-3 border border-gray-200 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none bg-white font-bold" placeholder="Precio Unit." value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: +e.target.value})} />
                 <button onClick={handleAddItem} className="md:col-span-1 bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all active:scale-90">
                   <Plus size={20}/>
                 </button>
               </div>

               {items.length > 0 && (
                 <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden mt-4">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Descripción</th>
                          <th className="px-4 py-3 text-center font-bold uppercase tracking-wider">Cant.</th>
                          <th className="px-4 py-3 text-right font-bold uppercase tracking-wider">Total Item</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((it) => (
                          <tr key={it.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 text-slate-700 font-medium">{it.description}</td>
                            <td className="px-4 py-3 text-center font-bold text-slate-500">{it.quantity}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(it.quantity * it.unitPrice)}</td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => handleRemoveItem(it.id)} className="text-red-400 hover:text-red-600 transition-colors p-1.5"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Valor Mano de Obra (Instalación/Config.)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input type="number" className="w-full border border-gray-200 p-4 pl-8 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50/50 font-bold text-slate-700" placeholder="0" value={laborCost} onChange={e => setLaborCost(+e.target.value)} />
                  </div>
                </div>
                <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <span>Subtotal Equipos + MO:</span>
                    <span>{formatCurrency(items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0) + laborCost)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-800 pb-2">
                    <span>IVA Aplicado (19%):</span>
                    <span>{formatCurrency((items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0) + laborCost) * 0.19)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-slate-200 uppercase tracking-tighter">Total General</span>
                    <span className="text-2xl font-black text-orange-400 tracking-tight">
                      {formatCurrency((items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0) + laborCost) * 1.19)}
                    </span>
                  </div>
                </div>
             </div>

             <div className="flex space-x-4 pt-4">
                <button onClick={() => setIsFormOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all">Descartar</button>
                <button onClick={handleSaveQuote} className="flex-[2] bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all active:scale-[0.98]">
                  Generar Cotización y PDF
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesModule;
