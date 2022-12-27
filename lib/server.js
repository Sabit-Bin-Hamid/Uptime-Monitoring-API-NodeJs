// description:  server file. project initail file to start the server and worker
// dependencis
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');


// server module - module scaffold
const server = {};

// create server
server.createServer = () => {
     const createServerVariable = http.createServer(server.handleReqRes);
     createServerVariable.listen(environment.port, () => {
          console.log(`listening from ${environment.port}`);
     })
}

// handeling req and res
server.handleReqRes = handleReqRes;

server.init = () => {
     server.createServer();
}

// export
module.exports = server;
