var api_key = 'key-fef527ae661f452ef1ae1f472f5aa82f';
var domain = 'mg.zyonel.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain, host: "api.eu.mailgun.net"});
//const api_key = "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";
//const sgMail = require('@sendgrid/mail');
//sgMail.setApiKey(api_key);
 
exports.sendMail = (to, subject, emailBody, attachment=null) => {    
  const data = {
      from: 'P.L.A.C.E <noreply@plide.ng>',
      to: to,         // List of recipients
      subject: subject, // Subject line
      html: emailBody //HTML Body
  };  

  if(attachment) {
     data.attachment = attachment;
  }

  mailgun.messages().send(data, function (error, body) {
    console.log("error",error);
    console.log(body);
  });
       
 /*  sgMail.send(message).then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
    return error;
  }) */
}
