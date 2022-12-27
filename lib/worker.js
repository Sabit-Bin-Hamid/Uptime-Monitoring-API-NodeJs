// description:  worker library. project initail file to start the server and worker
// dependencis
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');
const url = require('url');
const {sendTwilioSms}=require('../helpers/notifications')


// worker module - module scaffold
const worker = {};

// start  worker
// getall Workers function
worker.getAllchecks = () => {
     data.list('checks', (err, checks) => {
          if (!err && checks && checks.length > 0) {
               checks.forEach(check => {
                    // read the check data
                    data.read('checks', check, (err,originalCheckData) => {
                         if (!err && originalCheckData) {
                              // pass the data next process check_validator()
                              let parsedOriginalCheckData = { ...parseJSON(originalCheckData) };
                              worker.validateCheckData(parsedOriginalCheckData)
                         }else{console.log('error: reading one of the check data!');}
                    })
               })
          }else{ console.log("error: could not find any checks to process");}
     })
};


// validate individual check Data
worker.validateCheckData = (parsedOriginalCheckData) => {
     let originalCheckData = parsedOriginalCheckData;
     if (originalCheckData && originalCheckData.id) {

          originalCheckData.state = typeof (originalCheckData.state) === 'string'
               && ['up', 'down'].indexOf(originalCheckData.start) > -1
               ? originalCheckData.state : 'down';
          
          originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) === 'number'
               && originalCheckData.lastChecked > 0
               ? originalCheckData.lastChecked : false;
          
          worker.performCheck(originalCheckData);
               
     }else{console.log('error: checks was invalide!!');}
}

// perform check
worker.performCheck = (originalCheckData) => {
     let originalData = originalCheckData;

     // prepare the initial check outcome
     let checkOutCome = {
          error: false,
          responceCode: false,
     };
     // make the outcome has not been set yet
     let outComeSent = false;
     // parse the host name
     const parseUrl = url.parse(`${originalData.protocol}://${originalData.url}`, true);
     const hostName = parseUrl.hostname;
     const path = parseUrl.path;
     
     // construct the request
     const requestDetails = {
          'protocol': originalData.protocol + ":",
          'hostname': hostName,
          'method': originalData.method.toUpperCase(),
          'path': path,
          'timeout':originalData.timeOutSeconds*1000,
     }

     const protocolToUse = originalData.protocol === 'http' ? http : https;

     const req = protocolToUse.request(requestDetails, (res) => {
          const status = res.statusCode;

          // update the check outcome and pass to the next process
          checkOutCome.responceCode = status;
          if (!outComeSent) {
               worker.processCheckOutcome(originalData, checkOutCome);
               outComeSent = true;
          }
     })

     req.on('error', (e) => {
          if (!outComeSent) {

               checkOutCome = {
                    error: true,
                    value: e,
               };

               worker.processCheckOutcome(originalData, checkOutCome);
               outComeSent = true;
          }
     })

     req.on('timeout', (e) => {
          checkOutCome = {
               error: true,
               value: 'timeout',
          };
          if (!outComeSent) {
               worker.processCheckOutcome(originalData, checkOutCome);
               outComeSent = true;
          }
     })

     req.end();


};

worker.processCheckOutcome = (originalData, checkOutCome) => {
     let state = !checkOutCome.error && checkOutCome.responceCode
          && originalData.successCode.indexOf(checkOutCome.responceCode) > -1
          ? 'up' : 'down';
     
     // decide we should alert the user or not

     let alertWanted = originalData.lastChecked
          && originalData.state !== state
          ? true : false;
     
     // update the check data
     let newCheckData = originalData;
     newCheckData.state = state;;
     newCheckData.lastChecked = Date.now();

     // update database
     data.update('checks', newCheckData.id, newCheckData, (err) => {
          if (!err) {
               if (alertWanted) {
                    worker.alertUserToStatusChange(newCheckData);
               }  else{console.log("error:alert not needed");}
          }else{console.log("error:tring to save data of one of the checks");}
     })

     
}


worker.alertUserToStatusChange = (newCheckData) => {
     let message = `Alert:${newCheckData.method.toUpperCase()}
           ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
     
     sendTwilioSms(newCheckData.phone, message, (err) => {
          if (!err) {
               console.log(`Account corupted: ${message}`);
          }else{console.log("there was a problem sending sms");}
     })
}
// time intervel Loop for getAllchecks()
worker.loop = () => {
     setInterval(() => {
          worker.getAllchecks();
     }, 1000)
};

worker.init = () => {
     console.log('workers started');
     // get all checks
     worker.getAllchecks();

     // call worker.getAllchecks() function in loop intervel
     worker.loop();
}

// export
module.exports = worker;
