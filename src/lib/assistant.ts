import type { SupabaseClient } from '@supabase/supabase-js'
import type { Product } from '@/types/product'

export type AssistantReply = { answer: string; products: Product[] }

const money = (n: number) => `$${n.toFixed(2)}`

// Reads a budget like "under $50", "below 40", "less than 30 dollars"
function parseMaxPrice(q: string): number | null {
  const m = q.match(/(?:under|below|less than|max(?:imum)?|up to|cheaper than)\s*\$?\s*(\d+(?:\.\d+)?)/i)
  return m ? Number(m[1]) : null
}

const ERAS = ['pharaonic', 'coptic', 'islamic', 'nubian', 'bedouin']

// Catalog assistant using retrieval only (free): Postgres full-text search over
// product titles, descriptions and era tags, plus a few simple intents.
// A generative model can be added later on top of these retrieved products.
export async function askAssistant(supabase: SupabaseClient, question: string): Promise<AssistantReply> {
  const q = question.trim()
  const lower = q.toLowerCase()
  const maxPrice = parseMaxPrice(q)
  const era = ERAS.find((e) => lower.includes(e))

  // Intent: stock questions (useful for sellers)
  if (/\b(low stock|out of stock|restock|running low|sold out|inventory)\b/.test(lower)) {
    const { data } = await supabase.from('products').select('*').lte('stock', 3).order('stock')
    const items = (data ?? []) as Product[]
    return {
      answer: items.length
        ? `${items.length} product${items.length > 1 ? 's are' : ' is'} low or out of stock (3 or fewer left): ` +
          items.map((p) => `${p.title} (${p.stock} left)`).join(', ') + '.'
        : 'Good news: every product has more than 3 pieces in stock.',
      products: items,
    }
  }

  // Intent: cheapest / most expensive
  if (/\b(cheapest|lowest price|most affordable|most expensive|priciest|premium)\b/.test(lower)) {
    const expensive = /\b(most expensive|priciest|premium)\b/.test(lower)
    let query = supabase.from('products').select('*').gt('stock', 0)
    if (era) query = query.ilike('era_tag', era)
    const { data } = await query.order('price', { ascending: !expensive }).limit(3)
    const items = (data ?? []) as Product[]
    return {
      answer: items.length
        ? `The ${expensive ? 'most premium' : 'most affordable'} pieces${era ? ` from the ${era} collection` : ''} ` +
          `in stock are: ${items.map((p) => `${p.title} at ${money(Number(p.price))}`).join(', ')}.`
        : 'I could not find any products in stock for that.',
      products: items,
    }
  }

  // Retrieval: full-text search over the catalog
  const { data: found } = await supabase.rpc('search_products', { q, max_results: 12 })
  let items = (found ?? []) as Product[]

  // If the question only had a budget or an era, fall back to filtering the catalog
  if (!items.length && (maxPrice !== null || era)) {
    let query = supabase.from('products').select('*')
    if (era) query = query.ilike('era_tag', era)
    const { data } = await query.order('price').limit(12)
    items = (data ?? []) as Product[]
  }

  if (maxPrice !== null) items = items.filter((p) => Number(p.price) <= maxPrice)
  if (era) items = items.filter((p) => (p.era_tag ?? '').toLowerCase() === era)

  const inStock = items.filter((p) => p.stock > 0).slice(0, 4)
  const soldOut = items.filter((p) => p.stock <= 0)

  if (!inStock.length) {
    return {
      answer:
        `I couldn't find a matching piece in stock${maxPrice !== null ? ` under ${money(maxPrice)}` : ''}. ` +
        'Try other words, like a material (brass, silver, papyrus), a room, or an era (Pharaonic, Coptic, Islamic, Nubian).' +
        (soldOut.length ? ` ${soldOut[0].title} matches but is sold out right now.` : ''),
      products: soldOut.slice(0, 2),
    }
  }

  const top = inStock[0]
  const others = inStock.slice(1)
  let answer =
    `I'd suggest the ${top.title} (${money(Number(top.price))}${top.era_tag ? `, ${top.era_tag}` : ''}). ` +
    (top.description ? `${top.description.split('. ')[0].replace(/\.$/, '')}.` : '')
  if (others.length) {
    answer += ` You might also like: ${others.map((p) => `${p.title} (${money(Number(p.price))})`).join(', ')}.`
  }
  if (soldOut.length) answer += ` (${soldOut.map((p) => p.title).join(', ')} also matched but is sold out.)`

  return { answer, products: inStock }
}
