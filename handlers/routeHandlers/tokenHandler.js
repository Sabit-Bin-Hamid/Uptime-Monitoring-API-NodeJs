
// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const { CreateRandomString } = require('../../helpers/utilities');

// handler module scaffold
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
     const acceptedMethods = ['get', 'post', 'put', 'delete'];
     if (acceptedMethods.indexOf(requestProperties.method) > -1) {
          handler._token[requestProperties.method](requestProperties,callback);
     } else { callback(405)}
};

handler._token = {};

// get request
handler._token.get = (requestProperties, callback) => {
     const id =
          typeof (requestProperties.queryStringObject.id) === 'string' &&
               requestProperties.queryStringObject.id.trim().length === 20
               ? requestProperties.queryStringObject.id.trim()
               : false;
     if (id) {
          data.read('token', id, (err, tokenData) => {
               const token = { ...parseJSON(tokenData) };
               if (!err) {
                    callback(200,token)
               }else{callback(404,{error:'Token was not found '})}
          })
     }else{callback(404,{error:'There was a problem in your request'})}
};

// post request
handler._token.post = (requestProperties, callback) => {
     const phone =
          typeof (requestProperties.body.phone) === 'string' &&
               requestProperties.body.phone.trim().length === 11
               ? requestProperties.body.phone.trim()
               : false;
     
     const password =
          typeof (requestProperties.body.password) === 'string' &&
               requestProperties.body.password.trim().length > 0
               ? requestProperties.body.password
               : false;
     
     if (phone && password) {
          data.read('users', phone, (err, userData) => {
               if (!err && userData) {
                    const user = { ...parseJSON(userData) };
                    const hashedPassword = hash(password)
                    if (hashedPassword === user.password) {
                         let tokenId = CreateRandomString(20);
                         let expires = Date.now() + 60 * 60 * 1000;
                         const tokenObject = {
                              phone, expires, id:tokenId
                         }
                         // store token data in db
                         data.create('token', tokenId, tokenObject, (err) => {
                              if (!err) {
                                   callback(200,{tokenObject,message:`Token for user(${user.firstName}) and Phone(${user.phone}) generated successfully!`})
                              } else { callback(400, { error:'A Problem in server!Try an hour later.'})}
                         })
                    }else{callback(400,{error:'Phone or Password invalid.'})}
               }else{callback(400,{error:'There is a problem in server!Try few hours later.'})}
          })
     }else{callback(400,{error:'You have a problem in your request'})}
};

// put request
handler._token.put = (requestProperties, callback) => {
     const id =
          typeof (requestProperties.body.id) === 'string' &&
               requestProperties.body.id.trim().length ===20
               ? requestProperties.body.id.trim()
               : false;
     
     const extend =
          typeof (requestProperties.body.extend) === "boolean" &&
               requestProperties.body.extend===true
               ? requestProperties.body.extend
               : false;
     
     if (id && extend) {
          data.read('token', id, (err, tokenData) => {
               const tokenObject = { ...parseJSON(tokenData) };;
               if (!err && tokenObject) {
                    if (Date.now() < tokenObject.expires) {
                         tokenObject.expires = Date.now() + 60 * 60 * 1000;
                         // store new token in db
                         data.update('token', id, tokenObject, (err) => {
                              if (!err) {
                                   callback(200, {message:`User (${tokenObject.phone}) your expires time is updated!`})
                              }else{callback(500,{error:'There was a problem in server!'})}
                         })
                    }else{callback(400,{message:'Token already expired ! Please request for new token.Thank you!'})}
               } else { callback(500,{error:'There was a problem in server!'})}
          })
     }else{callback(400,{error:'There was a problem in your request'})}
};

// delete request
handler._token.delete = (requestProperties, callback) => {
     const id =
          typeof (requestProperties.queryStringObject.id) === 'string' &&
               requestProperties.queryStringObject.id.trim().length === 20
               ? requestProperties.queryStringObject.id.trim()
               : false;
     
     if (id) {
          data.read('token', id, (err, tokenData) => {
               const token = { ...parseJSON(tokenData) };
               if (!err && token) {
                    data.delete('token', id, (err) => {
                         if (!err) {
                              callback(200, { message:`Phone(${token.phone}): Token delete successfully!`})
                         }else{ callback(500, {message:'Token is a problem in server site!'})}
                    })
               } else { callback(500, {message:'There is a problem in server site!'})}
          })
     }else{callback(400,{error:'In valid Token id. please try again!'})}
};


// varify token
handler._token.verify = (id, phone, callback) => {
     data.read('token', id, (err, tokenData) => {
          const token = { ...parseJSON(tokenData) };
          if (!err && token) {
               if (token.phone === phone && token.expires > Date.now()) {
                    callback(true);
               }
               else { callback(false) }
          } else { callback(false)}
     })
}


// emport module
module.exports = handler;