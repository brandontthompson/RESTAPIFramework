const router = require('express').Router();
const Log = require('../core/logger/Log');

// register endpoints
const component = {
    user: require('./user/router'),
}

// bind the path to the router 
// api/dict_key/endpoint

for (const [route, endpoint] of Object.entries(component)) {
    router.use("/" + route, endpoint);
    Log.writeLog("[ PROTECTED ] Module Loaded: {0}", route);
}

module.exports = router;