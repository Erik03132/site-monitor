import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendNotificationEmail({
    to,
    siteName,
    siteUrl,
    changesCount,
    foundKeywords,
    summary
}: {
    to: string
    siteName: string
    siteUrl: string
    changesCount: number
    foundKeywords: string[]
    summary?: string
}) {
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured')
        return
    }

    const subject = foundKeywords.length > 0
        ? `🔔 Найдено ключевое слово на ${siteName}!`
        : `📈 Обнаружены изменения на ${siteName}`

    try {
        await resend.emails.send({
            from: 'Site Monitor <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2563eb;">${subject}</h2>
          <p>Мы обнаружили изменения на сайте <strong>${siteName}</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${summary ? `<p style="font-style: italic; margin-bottom: 10px;">"${summary}"</p>` : ''}
            <ul style="margin: 0; padding-left: 20px;">
              <li>Всего изменений: <strong>${changesCount}</strong></li>
              ${foundKeywords.length > 0 ? `<li>Найдено слов: <span style="color: #dc2626; font-weight: bold;">${foundKeywords.join(', ')}</span></li>` : ''}
            </ul>
          </div>

          <a href="${siteUrl}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
             Перейти на сайт
          </a>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 12px; color: #6b7280;">
            Вы получили это письмо, так как подписаны на мониторинг этого сайта.
          </p>
        </div>
      `
        })
        console.log(`Email sent to ${to} for site ${siteName}`)
    } catch (error) {
        console.error('Failed to send email:', error)
    }
}
