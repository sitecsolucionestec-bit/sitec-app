import { AppState, Quote, Client } from './types';

const STORAGE_KEY = 'sitec_app_data';

export const DEFAULT_QUOTE_OBSERVATIONS = `- Cliente suministra todos los accesos requeridos de altura, escaleras, manlift, andamios, etc.\n- No incluye recargo de trabajo nocturno, ni presencia de personal siso, de ser necesario o requerido, el costo será asumido por el cliente.\n- Tiempo de trabajo estimado: Según cronograma.\n- No incluye canaletas, tuberías y puntos de corriente.`;

export const DEFAULT_COMMERCIAL_CONDITIONS = `Moneda: Pesos Colombianos (COP)
Forma de pago: 50% Anticipo - 50% Entrega
Vigencia: 15 días calendario
Garantía: Un (1) año por defectos de fábrica
Entrega: Según disponibilidad técnica
Obras Civiles: No incluidas
Infraestructura: Suministrada por el cliente`;

export const SITEC_BANK_INFO = "BANCOLOMBIA N° CUENTA AHORRO: 67800017190 - SITEC SOLUCIONES TECNOLOGICAS INTEGRALES SAS NIT 901806525-3";

export const initialData: AppState = {
  clients: [],
  technicians: [],
  quotes: [],
  visits: [],
  reports: [],
  maintenance: [],
  syncConfig: {
    enabled: false,
    supabaseUrl: '',
    supabaseKey: ''
  }
};

export const loadData = (): AppState => {
  if (typeof window === 'undefined') return initialData;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return initialData;
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialData;
  }
};

export const saveData = (data: AppState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    if (data.syncConfig?.enabled && data.syncConfig.supabaseUrl && data.syncConfig.supabaseKey) {
      syncToSupabase(data).catch(console.error);
    }
  }
};

/**
 * Sube los datos locales a Supabase (Upsert)
 */
async function syncToSupabase(data: AppState) {
  const { supabaseUrl, supabaseKey } = data.syncConfig!;
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  };

  try {
    if (data.clients.length > 0) {
      await fetch(`${supabaseUrl}/rest/v1/clients`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data.clients.map(c => ({
          id: c.id,
          name: c.name,
          nit: c.nit,
          address: c.address,
          phone: c.phone,
          email: c.email,
          contact_person: c.contactPerson
        })))
      });
    }

    if (data.quotes.length > 0) {
      await fetch(`${supabaseUrl}/rest/v1/quotes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data.quotes.map(q => ({
          id: q.id,
          client_id: q.clientId,
          data: q
        })))
      });
    }

    const updatedConfig = { ...data.syncConfig!, lastSync: new Date().toISOString() };
    const finalData = { ...data, syncConfig: updatedConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
  } catch (error) {
    console.warn('Sync fallido (posiblemente falta internet):', error);
  }
}

/**
 * Descarga los datos desde Supabase a la App local
 */
export const fetchFromSupabase = async (config: { supabaseUrl: string, supabaseKey: string }): Promise<Partial<AppState>> => {
  const { supabaseUrl, supabaseKey } = config;
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  };

  try {
    const [clientsRes, quotesRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/clients`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/quotes`, { headers })
    ]);

    if (!clientsRes.ok || !quotesRes.ok) throw new Error('Error al descargar datos');

    const rawClients = await clientsRes.json();
    const rawQuotes = await quotesRes.json();

    return {
      clients: rawClients.map((c: any) => ({
        id: c.id,
        name: c.name,
        nit: c.nit,
        address: c.address,
        phone: c.phone,
        email: c.email,
        contactPerson: c.contact_person
      })),
      quotes: rawQuotes.map((q: any) => q.data)
    };
  } catch (error) {
    console.error('Error en fetchFromSupabase:', error);
    throw error;
  }
};

export const exportToJson = (data: AppState) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = `SITEC_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

export const generatePDF = (title: string, content: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`<html><body style="font-family:sans-serif;padding:40px"><h1>${title}</h1><pre>${content}</pre></body></html>`);
  printWindow.document.close();
  printWindow.print();
};

export const generateQuotePDF = (quote: Quote, client: Client | undefined) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`<html><body style="font-family:sans-serif;padding:40px"><h2>COTIZACIÓN ${quote.id}</h2><p>Cliente: ${client?.name}</p></body></html>`);
  printWindow.document.close();
  printWindow.print();
};

export const shareWhatsApp = (message: string) => {
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};