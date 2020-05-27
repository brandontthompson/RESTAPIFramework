const mysql = require('../database/query');
const Log = require('../logger/Log');
const crypt = require('./crypt');

const config = require('../../core/config');

//TODO: refactor file a lil
const Key = ((key) => {
    this.key = key;
});

Key.protect = (async (req, res, next) => {
    if (await Key.verify(req.params.key))
        next();
    Log.writeError("invalid key {0}", req.params.key);
    res.status(401).end();
});

Key.create = ((request) => {
    return new Promise(async (resolve, reject) => {
        await Key.issue(request)
            .then((results) => {
                if (!results)
                    reject('failed');
                resolve(results);
            }).catch((error) => {
                Log.writeError(error);
                throw error;
            });
    });
});

Key.issue = (async (request) => {
    const key = await crypt.bytes(45)
    const hash_key = await crypt.hash(key, config.key.salt);

    const params = {
        id: null,
        key: hash_key.hash,
        request_id: request.id,
        active: true,
        created: Date.now()
    };
    try {
        await mysql.insert('auth_api_key', params);
        return key;
    } catch (error) {
        Log.writeError(error);
        throw error;
    }
});

Key.verify = (async (key) => {
    let results = null;
    key = await crypt.hash(key, config.key.salt);

    try {
        results = await mysql.get('auth_api_key', ['auth_api_key_key', '=', key.hash]);
    } catch (error) {
        Log.writeError(error);
        return false;
    }
    if (results > 0)
        if (results.data.records[0].auth_api_key_expires > Date.now() || results.data.records[0].auth_api_key_expires == null)
            return true;
    return false;
});

module.exports = Key;