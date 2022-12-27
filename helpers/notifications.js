// dependencies
const https = require('https');
const { twilio } = require('./environments');
const queryString = require('querystring');
// scaffolding
const notifications = {};


notifications.sendTwilioSms = (phone,msg,callback) => {
     const userPhone = typeof (phone) === 'string' &&
          phone.trim().length === 11 ? phone : false;
     
     const userMsg = typeof (msg) === 'string' && msg.trim().length >= 1
          && msg.trim().length <= 1600 ? msg : false;
     
     if (userPhone && userMsg) {
          
          // configer the request payloade
          const payload = {
               From: twilio.FromPhone,
               To: `+88${userPhone}`,
               Body: userMsg,
          }
          // stringify the payload
          const stringifypayload = queryString.stringify(payload);

          // https request details
          const requestDetails = {
               hostname: 'api.twilio.com',
               method: 'POST',
               path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
               auth: `${twilio.accountSid}:${twilio.authToken}`,
               headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
               }
          };

          const req = https.request(requestDetails, (res) => {
               let status = res.statusCode;
               console.log(status);
               if (status === 200 || status === 201||status === 300 ||status === 301 ||status === 302 ) {
                    callback(false)
               } else { callback(`Status Code Returned Was ${status}`) }
          });

          req.on('error', (e) => {
               callback(e);
          });
          req.write(stringifypayload);
          req.end();

     }else{callback('Given Parameter was Wrong Or Invalide!')}
     
}

// module export 
module.exports = notifications;