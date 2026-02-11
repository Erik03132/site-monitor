export interface AIProvider {
    summarizeChange(oldContent: string | null, newContent: string | null): Promise<string>
}

export class MoonshotProvider implements AIProvider {
    private apiKey: string
    private baseUrl = 'https://api.moonshot.cn/v1'

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    async summarizeChange(oldContent: string | null, newContent: string | null): Promise<string> {
        if (!this.apiKey) return 'API key not configured'

        const prompt = `
      Ты — аналитик изменений контента на сайтах. 
      Сравни старый и новый текст и напиши ОДНО короткое предложение в 5-10 слов, что именно изменилось.
      Используй профессиональный, лаконичный стиль.
      
      СТАРЫЙ ТЕКСТ:
      ${oldContent || '(пусто)'}
      
      НОВЫЙ ТЕКСТ:
      ${newContent || '(пусто)'}
      
      РЕЗЮМЕ ИЗМЕНЕНИЙ:
    `

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'moonshot-v1-8k',
                    messages: [
                        { role: 'system', content: 'Вы лаконичный помощник, который анализирует изменения текста.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.3
                })
            })

            if (!response.ok) {
                throw new Error(`Kimi API error: ${response.status}`)
            }

            const data = await response.json()
            return data.choices[0].message.content.trim()
        } catch (error) {
            console.error('Kimi analysis failed:', error)
            return 'Не удалось проанализировать изменения'
        }
    }
}

export function getAIProvider(): AIProvider {
    const moonshotKey = process.env.MOONSHOT_API_KEY

    if (moonshotKey && moonshotKey !== 'your_moonshot_key') {
        return new MoonshotProvider(moonshotKey)
    }

    // Fallback if no provider configured
    return {
        async summarizeChange() {
            return 'Изменения зафиксированы (AI не настроен)'
        }
    }
}
