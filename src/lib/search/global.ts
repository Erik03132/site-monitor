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
  Focus on events from the last 24-48 hours. 
  Provide results as a JSON array of objects with keys: title, url, snippet, source.`

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar-reasoning-pro', // or sonar-small-online
                messages: [
                    { role: 'system', content: 'You are a real-time news and web search engine. Return ONLY a valid JSON array.' },
                    { role: 'user', content: query }
                ],
                response_format: { type: 'json_object' }
            })
        })

        const data = await response.json()
        const content = data.choices[0].message.content

        // Extract JSON array from LLM response
        const jsonMatch = content.match(/\[.*\]/s)
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0])
        }

        return []
    } catch (error) {
        console.error('Perplexity search error:', error)
        return []
    }
}
