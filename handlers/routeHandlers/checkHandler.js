// dependencies
const data = require('../../lib/data');
const {CreateRandomString } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } =require('../../helpers/environments');

// handler module scaffold
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
     const acceptedMethods = ['get', 'post', 'put', 'delete'];
     if (acceptedMethods.indexOf(requestProperties.method) > -1) {
          handler._check[requestProperties.method](requestProperties,callback);
     } else { callback(405)}
};

handler._check = {};
// get request
handler._check.get = (requestProperties, callback) => {
     const id =
          typeof (requestProperties.queryStringObject.id) === 'string' &&
               requestProperties.queryStringObject.id.trim().length === 20
               ? requestProperties.queryStringObject.id.trim()
               : false;
     if (id) {
          data.read('checks', id, (err, checksData) => {
               if (!err && checksData) {
                    const checkObj={...parseJSON(checksData)}
                    const token =
                         typeof requestProperties.headersObject.token === 'string'
                              && requestProperties.headersObject.token.trim().length === 20
                              ? requestProperties.headersObject.token.trim()
                              : false;
                   
                    tokenHandler._token.verify(token, checkObj.phone, (tokenValid) => {
                         if (tokenValid) {
                              callback(200, checkObj);
                         }else{callback(403,{error:'Authentication problem!'})}
                    });
               }else{callback(500,{error:'Problem in server!'})}
          })
     }else{callback(400,{error:'Problem in your request!'})}
};

// post request
handler._check.post = (requestProperties, callback) => {
     // validate import
     const protocol =
          typeof requestProperties.body.protocol === 'string' &&
               ["http", 'https'].indexOf(requestProperties.body.protocol) > -1
               ? requestProperties.body.protocol
               : false;

     const url =
          typeof requestProperties.body.url === 'string' &&
               requestProperties.body.url.trim().length > 0
               ? requestProperties.body.url.trim()
               : false;
     
     const method =
          typeof (requestProperties.body.method) === 'string' &&
               ["GET", 'PUT', "DELETE", "POST"].indexOf(requestProperties.body.method) > -1
               ? requestProperties.body.method.trim()
               : false
     
     const successCode =
          typeof (requestProperties.body.successCode) === 'object' &&
               requestProperties.body.successCode instanceof Array
               ? requestProperties.body.successCode : false
     
     const timeOutSeconds =
          typeof (requestProperties.body.timeOutSeconds) === 'number'
               && requestProperties.body.timeOutSeconds >= 1
               && requestProperties.body.timeOutSeconds <= 5
               && requestProperties.body.timeOutSeconds % 1 === 0
               ? requestProperties.body.timeOutSeconds
               : false
     
     // console.log(protocol , url , method , successCode , timeOutSeconds);
     if (protocol && url && method && successCode && timeOutSeconds) {
          const token =
               typeof requestProperties.headersObject.token === 'string'
                    && requestProperties.headersObject.token.trim().length === 20
                    ? requestProperties.headersObject.token.trim()
                    : false;
          
          // lookUp userObj phone in Token
          data.read('token', token, (err1, tokenData) => {
               if (!err1 && tokenData) {
                    let phone = parseJSON(tokenData).phone;
                    data.read('users', phone, (err2, userData) => {
                         if (!err2 && userData) {
                              tokenHandler._token.verify(token, phone, (tokenIdValid) => {
                                   if (tokenIdValid) {
                                        let userObject = { ...parseJSON(userData) };

                                        let userChecks = typeof userObject.checks === 'object'
                                             && userObject.checks instanceof Array
                                             ? userObject.checks
                                             : [];
                                        
                                        if (userChecks.length < maxChecks) { //maxChecks is set in environments.js
                                             let checkId = CreateRandomString(20);
                                             let checkObject = {
                                                  id: checkId, phone, protocol, url,
                                                  method, successCode, timeOutSeconds
                                             }
                                             // save the object
                                             data.create('checks', checkId, checkObject, (err3) => {
                                                  if (!err3) {
                                                       // addd checkid to userObj objcects
                                                       userObject.checks = userChecks;
                                                       userObject.checks.push(checkId)
                                                       // save the new userObj data
                                                       data.update('users', phone, userObject, (err4) => {
                                                            if (!err4) {
                                                                 callback(200,checkObject)
                                                            }else{callback(500,{error: "Problem in server"})}
                                                       })
                                                  } else { callback(500, {error: "Problem in server"})}
                                             })
                                        }else{callback(403, { error: 'User already cross max checks limit.' })}
                                   } else { callback(403, { error: 'Authantication problem!' }) }
                              })
                         }else{callback(403,{error:'User not found'})}
                    })
               }else{callback(403,{error:'Authantication problem!'})}
          })
     }else{callback(400,{error:'You have a pronlem in your request'})}
     
};

// put request
handler._check.put = (requestProperties, callback) => {
     const id =
          typeof (requestProperties.queryStringObject.id) === 'string' &&
               requestProperties.queryStringObject.id.trim().length === 20
               ? requestProperties.queryStringObject.id.trim()
               : false;
          // validate import
     const protocol =
          typeof requestProperties.body.protocol === 'string' &&
               ["http", 'https'].indexOf(requestProperties.body.protocol) > -1
               ? requestProperties.body.protocol
               : false;

     const url =
          typeof requestProperties.body.url === 'string' &&
               requestProperties.body.url.trim().length > 0
               ? requestProperties.body.url.trim()
               : false;

     const method =
          typeof (requestProperties.body.method) === 'string' &&
               ["GET", 'PUT', "DELETE", "POST"].indexOf(requestProperties.body.method) > -1
               ? requestProperties.body.method.trim()
               : false;

     const successCode =
          typeof (requestProperties.body.successCode) === 'object' &&
               requestProperties.body.successCode instanceof Array
               ? requestProperties.body.successCode : false;

     const timeOutSeconds =
          typeof (requestProperties.body.timeOutSeconds) === 'number'
               && requestProperties.body.timeOutSeconds >= 1
               && requestProperties.body.timeOutSeconds <= 5
               && requestProperties.body.timeOutSeconds % 1 === 0
               ? requestProperties.body.timeOutSeconds
               : false;
     if (id) {
          if (protocol || url || method || successCode || timeOutSeconds) {

               data.read('checks', id, (err, checksData) => {
                    if (!err && checksData) {

                         let checksObj = { ...parseJSON(checksData) };
                         const token =
                              typeof requestProperties.headersObject.token === 'string'
                                   && requestProperties.headersObject.token.trim().length === 20
                                   ? requestProperties.headersObject.token.trim()
                                   : false;
                         
                         tokenHandler._token.verify(token, checksObj.phone, (tokenIsValid) => {
                              if (tokenIsValid) {

                                   if (protocol) checksObj.protocol = protocol;
                                   if (url) checksObj.url = url;
                                   if (method) checksObj.method = method;
                                   if (successCode) checksObj.successCode = successCode;
                                   if(timeOutSeconds) checksObj.timeOutSeconds=timeOutSeconds
                                   
                                   // store check Object
                                   data.update('checks', id, checksObj, (err) => {
                                        if (!err) {
                                             callback(200, {checksObj ,message:`User ${checksObj.phone} updated successfully!`});
                                        }else{callback(500,{error:'There is a problem in server!'})}
                                   })
                              }else{callback(403,{error:'Validation code expire or not getting currect token id!'})}
                         })
                         
                    }else{callback(500,{error:'Authentication Problem!'})}
               })
          }else{callback(400,{error:'You must provide at least one field to update!'})}
     }else{callback(400,{error:'Problem in your request!'})}
};

// delete request
handler._check.delete = (requestProperties, callback) => {
     
     const id =
          typeof (requestProperties.queryStringObject.id) === 'string' &&
               requestProperties.queryStringObject.id.trim().length === 20
               ? requestProperties.queryStringObject.id.trim()
               : false;
     if (id) {
          data.read('checks', id, (err, checksData) => {
               if (!err && checksData) {
                    const checkObj={...parseJSON(checksData)}
                    const token =
                         typeof requestProperties.headersObject.token === 'string'
                              && requestProperties.headersObject.token.trim().length === 20
                              ? requestProperties.headersObject.token.trim()
                              : false;
                   
                    tokenHandler._token.verify(token, checkObj.phone, (tokenValid) => {
                         if (tokenValid) {
                              // delete the check
                              data.delete('checks', id, (err) => {
                                   if (!err) {
                                        data.read('users', checkObj.phone, (err, userData) => {
                                             if (!err && userData) {

                                                  let userObj = { ...parseJSON(userData) };
                                                  let userChecks = typeof userObj.checks === 'object'
                                                       && userObj.checks instanceof Array
                                                       ? userObj.checks : [];
                                                  
                                                  let relatedChecksPosition = userChecks.indexOf(id);
                                                  // remove related check id from users
                                                  if (relatedChecksPosition > -1) {
                                                       userChecks.splice(relatedChecksPosition,1);
                                                  } else { callback(500, { error: 'Server side problem!' }) };
                                                  // resave in user checks
                                                  userObj.checks = userChecks;
                                                  // update the users in db
                                                  data.update('users', userObj.phone, userObj, (err) => {
                                                       if (!err) {
                                                            callback(200,{Messaeg:"User checks delete successfully!"})
                                                       }else{callback(500, { error: 'Server side problem!' })}
                                                  })

                                             }else{callback(500,{error:'There is a server side problem!'})}
                                        })
                                   }else{callback(500,{error:'There is a server side problem!'})}
                              })
                         }else{callback(403,{error:'Authentication problem!'})}
                    });
               }else{callback(500,{error:'Problem in server!'})}
          })
     }else{callback(400,{error:'Problem in your request!'})}
};



// emport module
module.exports = handler;