
// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
// handler module scaffold
const handler = {};

handler.userHandler = (requestProperties, callback) => {
     const acceptedMethods = ['get', 'post', 'put', 'delete'];
     if (acceptedMethods.indexOf(requestProperties.method) > -1) {
          handler._user[requestProperties.method](requestProperties,callback);
     } else { callback(405)}
};

handler._user = {};

// get request
handler._user.get = (requestProperties, callback) => {
     const phone =
          typeof (requestProperties.queryStringObject.phone) === 'string' &&
               requestProperties.queryStringObject.phone.trim().length === 11
               ? requestProperties.queryStringObject.phone.trim()
               : false;
     if (phone) {
          // varify token
          let token = typeof (
               requestProperties.headersObject.token) === 'string'
               && requestProperties.headersObject.token.length.trim() === 20
               ? requestProperties.headersObject.token.trim() : false;
          
          tokenHandler._token.verify(token, phone, (tokenId) => {
               if (tokenId) {
                    data.read('users', phone, (err, userData) => {
                         const user = { ...parseJSON(userData) };
                         if (!err) {
                              delete user.password;
                              callback(200,user)
                         }else{callback(404,{error:'User does not exist.'})}
                    })
               }else{callback(403,{error:'Request not found!..'})}
          })
          
          // look up user
         
     }else{callback(404,{error:'User does not exist.'})}
};

// post request
handler._user.post = (requestProperties, callback) => {
     const firstName =
          typeof (requestProperties.body.firstName) === 'string' &&
               requestProperties.body.firstName.trim().length > 0
               ? requestProperties.body.firstName
               : false;
     
     const lastName =
          typeof (requestProperties.body.lastName) === 'string' &&
               requestProperties.body.lastName.trim().length > 0
               ? requestProperties.body.lastName
               : false;
     
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
     
     const tosAgreement =
          typeof (requestProperties.body.tosAgreement) === "boolean" &&
               requestProperties.body.tosAgreement
               ? requestProperties.body.tosAgreement
               : false;
     // console.log(firstName,lastName,phone,password , tosAgreement );
     if (firstName && lastName && phone && password && tosAgreement) {
          // make sure that user does not exist
          data.read('users', phone, (err) => {
               if (err) {
                    let userObject = { firstName, lastName, phone, password: hash(password), tosAgreement };
                    // store to db
                    data.create('users', phone, userObject, (err) => {
                         if (!err) {
                              callback(200, { message:'User create successfully!'})
                         } else { callback(500, { error:'Could not create user.'})}
                    });
               } else { callback(500, { message:'Account already exist by this phone Number.'})}
          });
     } else { callback(400, {error:'You have a problem in your request'})}
};

// put request
handler._user.put = (requestProperties, callback) => {
     const firstName =
          typeof (requestProperties.body.firstName) === 'string' &&
               requestProperties.body.firstName.trim().length > 0
               ? requestProperties.body.firstName
               : false;
     
     const lastName =
          typeof (requestProperties.body.lastName) === 'string' &&
               requestProperties.body.lastName.trim().length > 0
               ? requestProperties.body.lastName
               : false;
     
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
     
     if (phone) {
          if (firstName || password || lastName) {
               // verify token
               const token=typeof (
                    requestProperties.headersObject.token) === 'string'
                    && requestProperties.headersObject.token.length === 20
                    ? requestProperties.headersObject.token : false;
               
               tokenHandler._token.verify(token, phone, (tokenId) => {
                    if (tokenId) {
                         // loopkup the user
                         data.read('users', phone, (err, userData) => {
                              let user = { ...parseJSON(userData) };
                              if (!err && user) {
                                   if (firstName) { user.firstName = firstName; };
                                   if (password) { user.password = hash(password); };
                                   if (lastName) { user.lastName = lastName; };
                                   // store in database (update)
                                   data.update('users', phone, user,(err) => {
                                        if (!err) {
                                             callback(200,{message:'Update successfully!'})
                                        }else{callback(500,{error:'There is a problem in server side!'})}
                                   })
                              }else{callback(400,{error:'In valid phone number. please try again!'})}
                         })
                    }else{callback(403,{error:'Request not found!..'})}
               })
                
               
          }else{callback(400,{error:'In valid phone number. please try again!'})}
     }else{callback(400, {error:'In valid phone number. please try again!'})}
};

// delete request
handler._user.delete = (requestProperties, callback) => {
     const phone =
          typeof (requestProperties.queryStringObject.phone) === 'string' &&
               requestProperties.queryStringObject.phone.trim().length === 11
               ? requestProperties.queryStringObject.phone.trim()
               : false;
     
     if (phone) {
          // varify token
          const token=typeof (
               requestProperties.headersObject.token) === 'string'
               && requestProperties.headersObject.token.length === 20
               ? requestProperties.headersObject.token : false;
          
          tokenHandler._token.verify(token, phone, (tokenId) => {
               if (tokenId) {
                    data.read('users', phone, (err, userData) => {
                         const user={...parseJSON(userData)}
                         if (!err && user) {
                              data.delete('users', phone, (err) => {
                                   if (!err) {
                                        callback(200, { message:`Phone(${user.phone}): User delete successfully!`})
                                   }else{ callback(500, {message:'There is a problem in server site!'})}
                              })
                         } else { callback(500, {message:'There is a problem in server site!'})}
                    })
               } else { callback(403, { message:"Request not found!!.."})}
          })
          
          
     }else{callback(400,{error:'In valid phone number. please try again!'})}
};



// emport module
module.exports = handler;