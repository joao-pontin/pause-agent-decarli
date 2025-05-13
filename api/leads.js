import fetch from 'node-fetch'

export default async function handler(req, res) {
  const URL = process.env.SUPABASE_URL
  const KEY = process.env.SUPABASE_ANON_KEY  // só leitura

  const r = await fetch(
    `${URL}/rest/v1/leads?select=nome,whatsapp_id,modo_humano`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
  )
  const leads = await r.json()
  return res.status(200).json(leads)
}
