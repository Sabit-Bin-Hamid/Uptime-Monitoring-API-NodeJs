// dependencis
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const { userHandler } = require('./handlers/routeHandlers/userHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');
const { checkHandler } = require('./handlers/routeHandlers/checkHandler');
// module scaffold
const routes = {
     sample: sampleHandler,
     user: userHandler,
     token: tokenHandler,
     check:checkHandler,
}

// export routes 
module.exports = routes;