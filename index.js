// dependencis

const server = require('./lib/server');
const workers = require('./lib/worker');
// const {sendTwilioSms}=require('./helpers/notifications')


// app module - module scaffold
const app = {};

app.init = () => {
     // start the server 
     server.init();
     // start the worker
     workers.init();
}

// handeling req and res

app.init();

// export
module.exports = app;