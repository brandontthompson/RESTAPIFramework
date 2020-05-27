'use strict'

const express = require('express');
//const socketManager = require('./socket/socketManager');
const config = require('./config');
const Log = require('./logger/Log');

const app = express();

Log.writeLog("Initializing Server . . . ");

require('../middleware')(app);

Log.writeLog("Loading REST API Modules . . . ");

app.use('/api', require('./router'));
exports.start = (async () => {
    try {
        app.listen(config.port, () => {
            Log.writeLog("Server running! PORT: {0}", config.port);
        });
        //new socketManager(server);
    } catch (error) {
        Log.writeError('Server failed to start {0}', error)
    }
});