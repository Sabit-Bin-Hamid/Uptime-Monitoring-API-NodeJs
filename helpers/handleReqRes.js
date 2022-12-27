// dependencis
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');
const { parseJSON } = require('../helpers/utilities');

// helper module - module scaffold
const handler={}


// handeling req and res
handler.handleReqRes=(req, res) => {
     // request handeling
     // get url parse Property
     const parseUrl = url.parse(req.url, true);
     const path = parseUrl.pathname;
     const trimmedPath = path.replace(/^\/|\/$/g, '');
     const method = req.method.toLowerCase();
     const headersObject = req.headers;
     const queryStringObject = parseUrl.query;

     // get all request Properties
     const requestProperties = {
          parseUrl, path, trimmedPath, method, headersObject, queryStringObject
     };

     const decoder = new StringDecoder('utf-8');
     let realData = '';

     const choseHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;
     
     

     req.on('data', (buffer) => {
          realData += decoder.write(buffer);
     })
     req.on('end', () => {
          realData += decoder.end();

          requestProperties.body =parseJSON(realData);
          choseHandler(requestProperties, (statusCode, payload) => {
               statusCode = typeof (statusCode) === 'number' ? statusCode : 500;
               payload = typeof (payload) === 'object' ? payload : {};
     
               const payloadString = JSON.stringify(payload);

               res.setHeader('Content-Type','application/json')
               res.writeHead(statusCode);
               res.end(payloadString);
          });
     })
};
// export module
module.exports = handler;