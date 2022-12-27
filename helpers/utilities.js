// dependencis
const crypto = require('crypto');
const environments = require('../helpers/environments');
// utilities module
const utilities = {};

// parse JSON string to objects
utilities.parseJSON = (jsonString) => {
     let output;
     try {
          output = JSON.parse(jsonString);
     } catch {
          output = {};
     }
     return output;
};

// hasing password
utilities.hash = (str) => {
     if (typeof (str) === 'string' && str.length > 0) {
          const hash = crypto
               .createHmac('sha256', environments.secretKey)
               .update(str)
               .digest('hex');
               return hash;
     } else { return false; }
};

utilities.CreateRandomString = (strLength) => {
     let length = strLength;
     length = typeof strLength === 'number'
          && strLength > 0
          ? strLength
          : false;
     
     if (length) {
          let possibleChar = 'qwertyuioplkjhgABCDEFGHIJKLMNOPfdsazxcvbnm1234567890QRSTUVWXYZ';
          let randomString = "";
          for (let i = 1; i <= length; i++){
               let ramdomchar = possibleChar.charAt(
                    Math.floor(Math.random(i) * possibleChar.length))
               randomString+=ramdomchar
          }
          return randomString; 
     } else {return false;}
};

utilities.getHourAndMinute = (milliseconds) => {
     const padTo2Digits = (nums) => {
          return nums.toString().padStart(2, '0');
     }
     let seconds = Math.floor(milliseconds / 1000);
     let minutes = Math.floor(seconds / 60);
     let hours = Math.floor(minutes / 60);
     seconds = seconds % 60;
     minutes = minutes % 60;
     hours = hours % 24;
     return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;
 
}


// export module
module.exports = utilities;