import { Resend } from 'resend'
import config from '../config/config'

const resend = new Resend(config.EMAIL_SERVICE_API_KEY)

export default {
  sendMail: async (to: string[], subject: string, text: string) => {
    try {
      await resend.emails.send({
        from: 'Ahmed A. / prod-api-nodejs <onboarding@resend.dev>',
        to,
        subject,
        text
      })
    } catch (error) {
      throw error
    }
  }
}
