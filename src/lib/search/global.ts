export interface GlobalSearchResult {
    title: string
    url: string
    snippet: string
    source: string
    publishedDate?: string
}

export async function searchGlobalKeywords(keywords: string[]): Promise<GlobalSearchResult[]> {
    if (!process.env.PERPLEXITY_API_KEY) {
        console.error('PERPLEXITY_API_KEY not configured')
        return []
    }

    const query = `Find the latest mentions, news, and discussions about the following topics: ${keywords.join(', ')}. 
  Focus on the most relevant events from the last 24-48 hours. 
  For each news item, provide a detailed summary consisting of exactly 3 or 4 professional sentences that explain the core event and its significance.
  Return the results ONLY as a valid JSON object with a "results" key containing an array of objects. 
  Each object MUST have these keys: title, url, snippet, source.`

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar-reasoning-pro',
                messages: [
                    { role: 'system', content: 'You are a real-time news and web search engine. Your task is to extract news from the web and provide high-quality summaries. Return ONLY valid JSON.' },
                    { role: 'user', content: query }
                ],
                response_format: { type: 'json_object' }
            })
        })

        if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.status}`)
        }

        const data = await response.json()
        const content = data.choices[0].message.content

        try {
            const parsed = JSON.parse(content)
            return parsed.results || []
        } catch (e) {
            // Fallback: search for array in text if parsing fails
            const jsonMatch = content.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0])
            }
            throw e
        }
    } catch (error) {
        console.error('Perplexity search error:', error)
        return []
    }
}

