import React, { useState } from 'react';
import { Cloud, Download, Upload, Trash2, ShieldCheck, Database, Info, ExternalLink, RefreshCw, CloudDownload } from 'lucide-react';
import { AppState } from '../types';
import { exportToJson, initialData, fetchFromSupabase } from '../utils';

interface SettingsModuleProps {
  data: AppState;
  setData: React.Dispatch<React.SetStateAction<AppState>>;
}

const SettingsModule: React.FC<SettingsModuleProps> = ({ data, setData }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [tempConfig, setTempConfig] = useState(data.syncConfig || { enabled: false, supabaseUrl: '', supabaseKey: '' });

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (confirm('¿Desea sobrescribir todos los datos actuales con esta copia de seguridad?')) {
          setData(json);
          alert('Datos importados con éxito.');
        }
      } catch (err) {
        alert('Error al leer el archivo. Asegúrese de que sea un respaldo válido de SITEC.');
      }
    };
    reader.readAsText(file);
  };

  const handlePullFromCloud = async () => {
    if (!data.syncConfig?.supabaseUrl || !data.syncConfig?.supabaseKey) {
      alert('Primero configure y guarde la URL y la Key de Supabase.');
      return;
    }

    setIsSyncing(true);
    try {
      const cloudData = await fetchFromSupabase({
        supabaseUrl: data.syncConfig.supabaseUrl,
        supabaseKey: data.syncConfig.supabaseKey
      });
      
      if (confirm('Se han encontrado datos en la nube. ¿Desea descargarlos y actualizar su lista local?')) {
        setData(prev => ({
          ...prev,
          clients: cloudData.clients || prev.clients,
          quotes: cloudData.quotes || prev.quotes
        }));
        alert('Datos sincronizados desde la nube correctamente.');
      }
    } catch (err) {
      alert('Error al conectar con Supabase. Verifique sus credenciales e internet.');
    } finally {
      setIsSyncing(false);
    }
  };

  const saveSyncConfig = () => {
    setData({ ...data, syncConfig: tempConfig });
    alert('Configuración guardada. La App intentará sincronizar automáticamente al hacer cambios.');
  };

  const handleReset = () => {
    if (confirm('ADVERTENCIA: Se borrarán todos los clientes, cotizaciones y reportes locales. ¿Continuar?')) {
      setData(initialData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Cloud size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Sincronización Cloud</h3>
              <p className="text-orange-100 text-sm">Tu oficina técnica disponible en cualquier lugar.</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-orange-50 rounded-2xl border border-orange-100 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${data.syncConfig?.enabled ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`} />
              <div>
                <span className="block font-black text-orange-900 text-sm uppercase tracking-wider">Estado del Sistema</span>
                <span className="text-xs text-orange-700 font-bold">{data.syncConfig?.enabled ? 'CONECTADO A LA NUBE' : 'TRABAJANDO LOCALMENTE'}</span>
              </div>
            </div>
            <div className="flex gap-2">
               {data.syncConfig?.enabled && (
                 <button 
                  onClick={handlePullFromCloud}
                  disabled={isSyncing}
                  className="flex items-center space-x-2 bg-white text-orange-600 px-4 py-2 rounded-xl font-bold text-xs border border-orange-200 hover:bg-orange-100 transition-all disabled:opacity-50"
                 >
                   {isSyncing ? <RefreshCw className="animate-spin" size={16}/> : <CloudDownload size={16}/>}
                   <span>{isSyncing ? 'Sincronizando...' : 'Descargar de la Nube'}</span>
                 </button>
               )}
               <button 
                onClick={() => setTempConfig({...tempConfig, enabled: !tempConfig.enabled})}
                className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  tempConfig.enabled ? 'bg-orange-200 text-orange-700' : 'bg-orange-600 text-white shadow-lg shadow-orange-100'
                }`}
              >
                {tempConfig.enabled ? 'Desactivar Cloud' : 'Activar Cloud'}
              </button>
            </div>
          </div>

          {tempConfig.enabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project URL</label>
                  <input 
                    className="w-full border border-gray-100 p-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-mono text-[10px]"
                    placeholder="https://su-proyecto.supabase.co"
                    value={tempConfig.supabaseUrl}
                    onChange={e => setTempConfig({...tempConfig, supabaseUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Key (Anon Public)</label>
                  <input 
                    className="w-full border border-gray-100 p-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-mono text-[10px]"
                    placeholder="eyJhbGci..."
                    type="password"
                    value={tempConfig.supabaseKey}
                    onChange={e => setTempConfig({...tempConfig, supabaseKey: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                <a href="https://supabase.com" target="_blank" className="text-[10px] text-slate-400 font-bold flex items-center hover:text-orange-500 transition-colors uppercase tracking-widest">
                  <ExternalLink size={12} className="mr-1.5"/> Panel de Supabase
                </a>
                <button 
                  onClick={saveSyncConfig}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                >
                  Guardar y Conectar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
              <Database size={24} />
            </div>
            <h4 className="text-xl font-black text-slate-900 tracking-tight">Copia Manual (Offline)</h4>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">Si no tienes internet, puedes descargar un archivo con toda tu información para moverlo por WhatsApp o correo.</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => exportToJson(data)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group"
            >
              <div className="flex items-center">
                <Download className="text-slate-400 group-hover:text-orange-500 mr-3" size={20}/>
                <span className="font-bold text-slate-700 text-sm">Exportar SITEC_BACKUP.json</span>
              </div>
              <ShieldCheck size={16} className="text-emerald-500"/>
            </button>

            <label className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer group">
              <div className="flex items-center">
                <Upload className="text-slate-400 group-hover:text-orange-500 mr-3" size={20}/>
                <span className="font-bold text-slate-700 text-sm">Importar desde Archivo</span>
              </div>
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 flex flex-col border-b-4 border-b-red-500/10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
              <Trash2 size={24} />
            </div>
            <h4 className="text-xl font-black text-slate-900 tracking-tight">Mantenimiento</h4>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">Borra la memoria local de este dispositivo. No afecta lo que ya esté guardado en la nube.</p>
          
          <div className="mt-auto">
            <button 
              onClick={handleReset}
              className="w-full p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
            >
              Limpiar Base Local
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-slate-300 py-4">
        <Info size={14} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em]">SITEC Enterprise - v1.2.0 - Seguridad Industrial</span>
      </div>
    </div>
  );
};

export default SettingsModule;