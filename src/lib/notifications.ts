
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendChangeEmail(email: string, siteName: string, summary: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Aether Monitor <notifications@resend.dev>',
      to: [email],
      subject: `Обнаружены изменения: ${siteName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #050507;">
          <h2 style="color: #FF8A00;">Aether Monitor</h2>
          <p>Мы обнаружили изменения на сайте <b>${siteName}</b>.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
            <b>Резюме от ИИ:</b><br/>
            ${summary}
          </div>
          <p style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #FF8A00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Перейти в личный кабинет</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email service crash:', err);
    return { success: false, error: err };
  }
}
