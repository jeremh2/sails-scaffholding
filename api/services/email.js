var nodemailer = require("nodemailer");
var sesTransport = require('nodemailer-ses-transport');


//
// ### Scaffholding instructions ###
// 1 - Set the api keys of the email service provider - line 14-16
// 2 - Set the email adress of the default sender - line 44
//



var transporter = nodemailer.createTransport(sesTransport({
  accessKeyId: "",
  secretAccessKey: "",
  region: 'eu-west-1',
  rateLimit: 5 // do not send more than 5 messages in a second
}));



module.exports = {

  /* The most basic email service function, configured for default email sending
  * The minimum you need to send an email with it :
  * - destination email adress => options.to
  * - email subject => options.subject
  * Optionnaly, you can include :
  * - email content => options.text or options.html or both
  * - sender email and name => options.from
  * - email adress for response => options.replyTo
  */
  send: function(options) {

    var mailOptions = {
      to: options.to, // list of receivers
      subject: options.subject, // Subject line
      html: options.html
    };

    if (!options.html || options.text) mailOptions.text = options.text || 'No content email';
    else mailOptions.generateTextFromHTML = true;

    mailOptions.from = options.from || '';

    if (options.replyTo) mailOptions.replyTo = options.replyTo;


    transporter.sendMail(mailOptions); // use nodemailer configuration to actually send the email
  }

};
