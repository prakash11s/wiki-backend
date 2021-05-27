const nodemailer = require('nodemailer')
const Email = require('email-templates')
const Helpers = require('./Helper')

module.exports = {
  sendMail: async (toEmail, mailSubject, templateName, locale) => {
    if (process.env.SEND_EMAIL === 'true') {
      const configOption = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      }
      locale.line_logo = `${process.env.API_URL}storage/emails/line.png`
      locale.logo = `${process.env.API_URL}storage/emails/logo.png`
      locale.banner_logo = `${process.env.API_URL}storage/emails/banner.png`
      const viewPath = 'src/views/emails'
      const transporter = await nodemailer.createTransport(configOption)
      const email = new Email({
        transport: transporter,
        send: true,
        preview: false,
        views: {
          options: {
            extension: 'pug'
          },
          root: viewPath
        }
      })
      // send mail with defined transport object
      const info = await email.send({
        template: templateName,
        message: {
          from: `${Helpers.AppName} <${process.env.COMPANY_EMAIL}>`,
          to: toEmail,
          subject: mailSubject
        },
        locals: locale
      })
      if (info) {
        console.log('Message sent: %s', info.messageId)
      }
      return info
    } else {
      return true
    }
  }

}
