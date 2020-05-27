const jwt = require('jsonwebtoken');

const whitelist = require('./whitelist');
const crypt = require('./crypt');
const Secret = require('./secret');

const Log = require('../logger/Log');
const mysql = require('../database/query');
const config = require('../config');
const remoteAddress = require('../util/remoteAddress');

//TODO rewrite this crap

const Jsonwebtoken = ((jsonwebtoken) => {
    this.jsonwebtoken = jsonwebtoken;
});

Jsonwebtoken.verify = ((token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, ((error, payload) => {
            if (error) return reject(error);

            resolve(payload);
        }));
    });
});

Jsonwebtoken.create = (async (value) => {
    try {

        const secret = await crypt.bytes(15);

        const signed = jwt.sign(
            { user_id: value },
            secret,
            { expiresIn: config.secrets.jwtExp });

        await Secret.create(signed, value, secret)
            .catch((error) => {
                Log.writeError(error);
                throw new Error('Unable to create secret', error)
            });
        return signed;

    } catch (error) {
        Log.writeError(error);
    }
});

Jsonwebtoken.get = ((headers) => {
    try {
        return headers.authorization.split('Bearer ')[1].trim();
    } catch (error) {
        throw error
    }
});

Jsonwebtoken.payload = (async (token) => {
    const secret = await Secret.retrieve(token)
        .then((result) => {
            return result.data.records[0].jwt_secret_secret;
        }).catch((error) => {
            Log.writeError("invalid token {0}", error);
            throw error;
        });

    whitelist.verify(token).then((result) => {
        if (!result) throw error('does not exist');
    });

    return Jsonwebtoken.verify(token, secret)
        .then((payload) => {
            return payload
        }).catch((error) => {
            Log.writeError(error.message);
            throw error('invalid')
        });
});

Jsonwebtoken.protect = (async (req, res, next) => {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith('Bearer '))
        return res.status(401).end();

    const token = bearer.split('Bearer ')[1].trim();

    const secret = await Secret.retrieve(token)
        .then((result) => {
            return result.data.records[0].jwt_secret_secret;
        }).catch((error) => {
            Log.writeError("invalid token {0}", error);
            return null;
        });
    whitelist.verify(token).then(result => {

        if (!result) return res.status(401).end();

        try {
            Jsonwebtoken.verify(token, secret)
                .then((payload) => {
                    mysql.count('user', ['user_id', '=', payload.user_id])
                        .then(result => {
                            if (!result > 0) {
                                return res.status(401).end();
                            }

                            res.locals.user_id = payload.user_id;
                            next();
                        });
                }).catch(async (error) => {
                    Log.writeError(error.message);
                    return res.status(401).end()
                });

        } catch (error) {
            Log.writeError(error);
            return res.status(401).end()
        }

    }).catch(error => {
        Log.writeError(error);
        return res.status(401).end();
    });

});

Jsonwebtoken.issue = ((userid) => {
    return new Promise(async (resolve, reject) => {

        const token = await Jsonwebtoken.create(userid);
        whitelist.add(userid, token)
            .then(results => {
                if (!results) {
                    Log.writeError("error adding token to whitelist");
                    reject('failed');
                }
                resolve(token);
            }).catch(error => {
                Log.writeError(error);
                reject(error);
            });
    });
});

Jsonwebtoken.destroy = (async (token) => {
    const results = await mysql.count('jwt_whitelist', ['jwt_whitelist_token', '=', token]);
    if (results && results > 0)
        await mysql.delete('jwt_whitelist', ['jwt_whitelist_token', '=', token]);
});

module.exports = Jsonwebtoken;