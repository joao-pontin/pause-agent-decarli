const SUPABASE_URL = 'https://qjdggpdlwhiydrabwyyk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZGdncGRsd2hpeWRyYWJ3eXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0Nzg4NTAsImV4cCI6MjA1ODA1NDg1MH0.VmmnOuz3Xkt40MdztobCiXY1oofzaECF7Kg7U-SeEQg';

const leadSelect = document.getElementById('leadSelect');
const statusText = document.getElementById('statusText');
const toggleBtn = document.getElementById('toggleBtn');

let leads = [];
let currentStatus = null;

// Buscar leads com nome e whatsapp_id
async function fetchLeads() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/leads?select=nome,whatsapp_id,modo_humano`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  leads = await res.json();

  leads.forEach(lead => {
    const opt = document.createElement('option');
    opt.value = lead.whatsapp_id;
    opt.textContent = `${lead.nome || "Sem Nome"} (${lead.whatsapp_id})`;
    leadSelect.appendChild(opt);
  });
}

leadSelect.addEventListener('change', () => {
  const selectedId = leadSelect.value;
  const lead = leads.find(l => l.whatsapp_id === selectedId);

  if (lead) {
    currentStatus = lead.modo_humano;
    updateStatusText(currentStatus);
    toggleBtn.disabled = false;
  } else {
    statusText.textContent = '';
    toggleBtn.disabled = true;
  }
});

toggleBtn.addEventListener('click', async () => {
  const newStatus = !currentStatus;
  const whatsapp_id = leadSelect.value;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/leads?whatsapp_id=eq.${whatsapp_id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ modo_humano: newStatus })
  });

  if (res.ok) {
    currentStatus = newStatus;
    updateStatusText(newStatus);
    alert("Status atualizado com sucesso!");
  } else {
    alert("Erro ao atualizar o status.");
  }
});

function updateStatusText(status) {
    const isIAAtiva = !status; // IA ativa quando modo_humano é false
    statusText.className = "status " + (isIAAtiva ? "ativo" : "pausado");
    statusText.textContent = isIAAtiva ? "🤖 IA Ativa" : "👤 Modo Humano";
  }
  
  

fetchLeads();