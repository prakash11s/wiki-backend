var nodemailer = require('nodemailer');
var Email = require('email-templates');
const Helpers = require('./Helpers');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey('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');

module.exports = {
  configOption: Helpers.mailConfig,
  viewPath: Helpers.mailTemplatePath,
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
      };
      const viewPath = 'src/views/emails';
      const transporter = await nodemailer.createTransport(configOption);
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
      });
      // send mail with defined transport object
      const info = await email.send({
        template: templateName,
        message: {
          from: `${Helpers.AppName} <${process.env.COMPANY_EMAIL}>`,
          to: toEmail,
          subject: mailSubject
        },
        locals: locale
      });
      if (info) {
        console.log('Message sent: %s', info.messageId);
      }
      return info;
    }
    return true;
  },
  apiSendMail: async (toEmail, mailSubject, templateName, locale) => {
    if (process.env.SEND_EMAIL === "true") {
      const configOption = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      };
      const viewPath = 'src/views/email';
      const transporter = await nodemailer.createTransport(configOption);
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
      });
      // send mail with defined transport object
      const info = await email.send({
        template: templateName,
        message: {
          from: `${Helpers.AppName} <${process.env.COMPANY_EMAIL}>`,
          to: toEmail,
          subject: mailSubject
        },
        locals: locale
      });
      if (info) {
        console.log('Message sent: %s', info.messageId);
      }
      return info;
    } else {
      return true;
    }
  }
};
