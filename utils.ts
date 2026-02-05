import { AppState, Quote, Client, Technician, Visit, ExecutionReport, MaintenanceAlert } from './types';

const STORAGE_KEY = 'sitec_app_data';

export const DEFAULT_QUOTE_OBSERVATIONS = `• El cliente será responsable de suministrar todos los accesos requeridos para trabajos en altura, tales como escaleras, plataformas elevadoras (manlift), andamios u otros equipos necesarios.
• La presente cotización no incluye recargos por trabajo nocturno ni la presencia de personal de seguridad y salud en el trabajo (SISO). En caso de ser requerido por el cliente o por normativa, dichos costos serán asumidos directamente por el cliente.
• El tiempo estimado de ejecución del servicio es de siete (7) días hábiles, sujeto a la operación del cliente y a la disponibilidad de recursos necesarios para la realización de trabajos en altura.
• La cotización no incluye suministro ni instalación de canaletas, tuberías ni puntos de corriente eléctrica.`;

export const DEFAULT_COMMERCIAL_CONDITIONS = `• Vigencia de la cotización: 15 días calendario.
• Garantía: 12 meses en equipos por defectos de fábrica (No incluye daños eléctricos).
• Tiempo de entrega: 7 días hábiles tras confirmación de anticipo.
• Alcance de obras civiles: No aplica (Sujeto a requerimiento adicional).
• Infraestructura: El cliente debe garantizar puntos de red y energía operativos.
• Forma de Pago: 50% Anticipo - 50% Contra entrega.`;

export const SITEC_BANK_INFO = "BANCOLOMBIA • CUENTA DE AHORROS: 67800017190";
export const SITEC_FULL_ID = "SITEC SOLUCIONES TECNOLOGICAS INTEGRALES SAS • NIT: 901806525-3";
export const REPRESENTANTE_LEGAL = {
  nombre: "Mario Andres Combariza Lara",
  telefonos: "(+57) 318 471 3088 / (+57) 350 511 5354"
};

export const initialData: AppState = {
  clients: [],
  technicians: [],
  quotes: [],
  visits: [],
  reports: [],
  maintenance: [],
  syncConfig: { enabled: false, supabaseUrl: '', supabaseKey: '' }
};

export const loadData = (): AppState => {
  if (typeof window === 'undefined') return initialData;
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialData;
};

export const saveData = (data: AppState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (data.syncConfig?.enabled && data.syncConfig.supabaseUrl && data.syncConfig.supabaseKey) {
      syncToSupabase(data).catch(console.error);
    }
  }
};

async function syncToSupabase(data: AppState) {
  const { supabaseUrl, supabaseKey } = data.syncConfig!;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' };
  try {
    const syncPromises = [];
    if (data.clients.length > 0) syncPromises.push(fetch(`${supabaseUrl}/rest/v1/clients`, { method: 'POST', headers, body: JSON.stringify(data.clients.map(c => ({ id: c.id, name: c.name, nit: c.nit, address: c.address, phone: c.phone, email: c.email, contact_person: c.contactPerson }))) }));
    if (data.quotes.length > 0) syncPromises.push(fetch(`${supabaseUrl}/rest/v1/quotes`, { method: 'POST', headers, body: JSON.stringify(data.quotes.map(q => ({ id: q.id, client_id: q.clientId, data: q }))) }));
    await Promise.all(syncPromises);
  } catch (error) { console.warn('Sync parcial:', error); }
}

export const fetchFromSupabase = async (config: { supabaseUrl: string, supabaseKey: string }): Promise<Partial<AppState>> => {
  const { supabaseUrl, supabaseKey } = config;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const endpoints = ['clients', 'technicians', 'quotes', 'visits', 'reports', 'maintenance'];
  const results = await Promise.all(endpoints.map(e => fetch(`${supabaseUrl}/rest/v1/${e}`, { headers }).then(r => r.json())));
  return {
    clients: (results[0] || []).map((c: any) => ({ id: c.id, name: c.name, nit: c.nit, address: c.address, phone: c.phone, email: c.email, contactPerson: c.contact_person })),
    technicians: results[1] || [],
    quotes: (results[2] || []).map((q: any) => q.data),
    maintenance: (results[5] || []).map((m: any) => ({ id: m.id, clientId: m.client_id, systemType: m.system_type, lastMaintenanceDate: m.last_maintenance_date, next_maintenance_date: m.next_maintenance_date, status: m.status }))
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
};

export const exportToJson = (data: AppState) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', `SITEC_BACKUP.json`);
  linkElement.click();
};

export const generatePDF = (title: string, htmlContent: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: letter; margin: 1cm 1.5cm; }
          body { font-family: 'Helvetica', 'Arial', sans-serif; color: #334155; font-size: 11px; margin: 0; line-height: 1.4; }
          .container { width: 100%; }
          
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
          .company-name { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -1px; }
          .doc-type { text-align: right; }
          .doc-type h2 { margin: 0; font-size: 16px; color: #f97316; text-transform: uppercase; font-weight: 800; }
          .doc-type p { margin: 2px 0; font-weight: bold; font-size: 12px; }

          .representative-info { margin-bottom: 20px; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
          .representative-info p { margin: 2px 0; font-size: 10px; color: #64748b; font-weight: 600; }
          .representative-info strong { color: #0f172a; font-size: 11px; }

          .client-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; }
          .label-box { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; display: block; }
          .value-box { font-weight: 700; color: #1e293b; font-size: 11px; }

          .service-desc { margin-bottom: 25px; padding: 12px; border-left: 4px solid #f97316; background: #fffaf5; color: #0f172a; font-weight: 700; font-size: 12px; text-transform: uppercase; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #0f172a; color: white; padding: 10px; font-size: 9px; text-transform: uppercase; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }

          .totals-block { display: flex; justify-content: flex-end; margin-bottom: 30px; }
          .totals-table { width: 250px; }
          .totals-table td { border: none; padding: 4px 0; font-size: 11px; }
          .grand-total-row { border-top: 2px solid #0f172a; margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; font-weight: 900; }
          .total-price { color: #f97316; font-size: 16px; }

          .section-block { margin-top: 20px; }
          .section-title { font-size: 10px; font-weight: 900; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; display: block; }
          .section-text { font-size: 10.5px; color: #475569; white-space: pre-line; line-height: 1.5; }

          .payment-notice { text-align: center; margin: 30px 0; padding: 15px; border: 1px dashed #cbd5e1; border-radius: 8px; }
          .payment-notice strong { display: block; color: #f97316; font-size: 9px; text-transform: uppercase; margin-bottom: 4px; }
          .payment-notice span { font-weight: 900; font-size: 12px; color: #0f172a; }

          .footer { margin-top: 40px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">${htmlContent}</div>
      </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
};

export const generateQuotePDF = (quote: Quote, client: Client | undefined) => {
  const itemsHtml = quote.items.map(i => `
    <tr>
      <td>${i.description}</td>
      <td class="text-center font-bold">${i.quantity}</td>
      <td class="text-right">${formatCurrency(i.unitPrice)}</td>
      <td class="text-right font-bold">${formatCurrency(i.unitPrice * i.quantity)}</td>
    </tr>
  `).join('');

  const selectedServicesText = quote.serviceTypes.join(' / ');

  const htmlContent = `
    <div class="header">
      <div class="company-name">SITEC</div>
      <div class="doc-type">
        <h2>Cotización de servicios y productos</h2>
        <p>No. ${quote.id}</p>
        <p style="font-weight: 400; color: #64748b; font-size: 10px;">Fecha: ${new Date(quote.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>
    </div>

    <div class="representative-info">
      <p>Representante Legal: <strong>${REPRESENTANTE_LEGAL.nombre}</strong></p>
      <p>Líneas de atención: <strong>${REPRESENTANTE_LEGAL.telefonos}</strong></p>
    </div>

    <div class="client-section">
      <div>
        <span class="label-box">Datos del Cliente</span>
        <div class="value-box">${client?.name || 'N/A'}</div>
        <div class="value-box" style="font-weight:400">NIT: ${client?.nit || 'N/A'}</div>
      </div>
      <div>
        <span class="label-box">Contacto y Envío</span>
        <div class="value-box">${client?.contactPerson || 'N/A'}</div>
        <div class="value-box" style="font-weight:400">${client?.phone || ''} • ${client?.email || ''}</div>
      </div>
    </div>

    <div class="section-block">
      <span class="section-title">📌 Servicio Cotizado</span>
      <div class="service-desc">
        ${selectedServicesText}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th width="50%">Descripción del Producto / Servicio</th>
          <th width="10%" class="text-center">Cant.</th>
          <th width="20%" class="text-right">Precio Unit.</th>
          <th width="20%" class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals-block">
      <div class="totals-table">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px">
          <span>Subtotal Equipos/Materiales:</span>
          <span class="font-bold">${formatCurrency(quote.subtotalItems)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px">
          <span>Mano de Obra / Instalación:</span>
          <span class="font-bold">${formatCurrency(quote.laborCost)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px">
          <span>IVA 19%:</span>
          <span class="font-bold">${formatCurrency(quote.iva)}</span>
        </div>
        <div class="grand-total-row">
          <span>TOTAL GENERAL (COP)</span>
          <span class="total-price">${formatCurrency(quote.total)}</span>
        </div>
      </div>
    </div>

    <div class="section-block">
      <span class="section-title">📜 Condiciones Comerciales</span>
      <div class="section-text">${quote.commercialConditions || DEFAULT_COMMERCIAL_CONDITIONS}</div>
    </div>

    <div class="section-block">
      <span class="section-title">📝 Observaciones Especiales</span>
      <div class="section-text">${quote.observations || DEFAULT_QUOTE_OBSERVATIONS}</div>
    </div>

    <div class="payment-notice">
      <strong>Información para Pagos</strong>
      <span>${SITEC_BANK_INFO}</span>
    </div>

    <div class="footer">
      ${SITEC_FULL_ID}<br>
      Bucaramanga, Santander • Propuesta Comercial Formal
    </div>
  `;

  generatePDF(`COTIZACIÓN ${quote.id}`, htmlContent);
};

export const shareWhatsApp = (message: string) => {
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
};
