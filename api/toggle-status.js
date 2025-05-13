import fetch from 'node-fetch'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).end()

  const { id, modo_humano } = req.body
  const URL = process.env.SUPABASE_URL
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY  // operação protegida

  const r = await fetch(
    `${URL}/rest/v1/leads?whatsapp_id=eq.${id}`,
    {
      method: 'PATCH',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ modo_humano })
    }
  )
  if (!r.ok) {
    const err = await r.text()
    return res.status(r.status).json({ error: err })
  }
  return res.status(204).end()
}
