import './style.css'
import { createClient } from '@supabase/supabase-js'

// Inicializa Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const searchInput = document.getElementById('searchInput')
const leadSelect  = document.getElementById('leadSelect')
const statusText  = document.getElementById('statusText')
const toggleBtn   = document.getElementById('toggleBtn')

let leads = [], currentStatus = null

// Collator para ordenação em pt-br, sensitive: 'base' ignora acentos
const collator = new Intl.Collator('pt', { sensitivity: 'base', numeric: true })

// Normaliza string: remove acentos, trim e lowercase
function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Renderiza options ordenadas
function renderLeadOptions(list) {
  const sorted = [...list].sort((a, b) => {
    const nameA = a.nome || ''
    const nameB = b.nome || ''
    return collator.compare(nameA, nameB)
  })

  leadSelect.innerHTML = '<option value="">Selecione um lead…</option>'
  sorted.forEach(lead => {
    const opt = document.createElement('option')
    opt.value       = lead.whatsapp_id
    opt.textContent = `${lead.nome || '—'} (${lead.whatsapp_id})`
    leadSelect.append(opt)
  })
}

// Busca e carrega leads
async function fetchLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('nome,whatsapp_id,modo_humano')

    

  if (error) {
    console.error('Erro ao buscar leads:', error)
    return
  }

  // Debug: confira no console a coluna `nome`
  console.table(data)

  leads = data
  renderLeadOptions(leads)
}

// Atualiza badge de status
function updateStatusText() {
  const isIA = !currentStatus
  statusText.className   = `status ${isIA?'ativo':'pausado'}`
  statusText.textContent = isIA ? '🤖 IA Ativa' : '👤 Modo Humano'
}

// Seleção de lead
leadSelect.addEventListener('change', () => {
  const id   = leadSelect.value
  const lead = leads.find(l => l.whatsapp_id === id)
  if (!lead) return
  currentStatus = lead.modo_humano
  updateStatusText()
  toggleBtn.disabled = false
})

// Toggle status
toggleBtn.addEventListener('click', async () => {
  const novo = !currentStatus
  const { error } = await supabase
    .from('leads')
    .update({ modo_humano: novo })
    .eq('whatsapp_id', leadSelect.value)

  if (error) return alert('Erro ao atualizar status')

  currentStatus = novo
  updateStatusText()
})

// Busca por nome ou telefone e re-renderiza
searchInput.addEventListener('input', () => {
  const raw    = searchInput.value
  const norm   = normalize(raw)
  const onlyNum= norm.replace(/\D/g, '')

  const filtered = leads.filter(l => {
    const nomeNorm  = normalize(l.nome || '')
    const phoneNum  = (l.whatsapp_id || '').replace(/\D/g, '')
    return nomeNorm.includes(norm) || phoneNum.includes(onlyNum)
  })

  renderLeadOptions(filtered)
})

// Inicialização
fetchLeads()
