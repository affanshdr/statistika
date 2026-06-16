import KNOWLEDGE_ITEMS from './knowledge/knowledge.json'

// Common Indonesian stop words to filter out of the query to focus on keywords
const STOP_WORDS = new Set([
  'dan', 'di', 'ke', 'yang', 'adalah', 'ini', 'itu', 'saya', 'kamu', 'bisa', 
  'cara', 'apa', 'bagaimana', 'untuk', 'dengan', 'pada', 'dari', 'oleh', 
  'jika', 'atau', 'tapi', 'namun', 'ada', 'adapun', 'dalam', 'tentang', 
  'bahwa', 'akan', 'ingin', 'tahu', 'mau', 'sih', 'dong', 'kah'
])

export interface SearchResult {
  id: string
  title: string
  content: string
  category: string
  score: number
}

/**
 * Clean, normalize, and tokenize text into unique lowercase words
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word))
}

/**
 * Perform a keyword-based RAG search over knowledge items in the developer-managed static folder
 */
export async function searchKnowledge(query: string, limit: number = 3): Promise<SearchResult[]> {
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) {
    return []
  }

  // Load from local static JSON database
  const items = KNOWLEDGE_ITEMS.map((item, idx) => ({
    id: `local-${idx}`,
    title: item.title,
    content: item.content,
    category: item.category
  }))

  const scoredItems = items.map(item => {
    const titleTokens = tokenize(item.title)
    const contentTokens = tokenize(item.content)

    let score = 0

    // Count overlaps in title (weight = 3)
    queryTokens.forEach(token => {
      if (titleTokens.includes(token)) {
        score += 3
      }
      // Count overlaps in content (weight = 1)
      if (contentTokens.includes(token)) {
        score += 1
      }
    })

    return {
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      score
    }
  })

  // Filter items with score > 0, sort by score descending, and take the top items
  return scoredItems
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
