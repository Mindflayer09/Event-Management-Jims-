const nodemailer = require('nodemailer');

const createTransporter = () => {
  console.log(`📡 Initializing Mailer on Port: ${process.env.SMTP_PORT}`);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465', 
    
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000, 
  });
};

module.exports = createTransporter;