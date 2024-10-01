import { Resend } from 'resend'
import config from '../config'

const resend = new Resend(config.EMAIL_SERVICE_API_KEY)

export default {
  sendMail: async (to: string[], subject: string, text: string) => {
    try {
      await resend.emails.send({
        from: 'prod-api-nodejs / MA2 <onboarding@resend.dev>',
        to,
        subject,
        text
      })
    } catch (error) {
      throw error
    }
  }
}
