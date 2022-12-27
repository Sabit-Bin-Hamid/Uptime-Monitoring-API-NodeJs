
// dependencies

// handler module scaffold
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
     callback(200, { message: 'this is sample url' });;
};

// emport module
module.exports = handler;