
// dependencies

// handler module scaffold
const handler = {};

handler.notFoundHandler =(requestProperties,callback) => {         
     callback(404, { message: 'path not found' });;
};

// emport module
module.exports = handler;