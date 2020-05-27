const authentication = require('./authentication');
const Log = require('../../core/logger/Log');
const remoteAddress = require('../../core/util/remoteAddress');

const Authentication = ((authentication) => {
    this.authentication = authentication.authentication;
});

Authentication.default = ((req, res) => {
    res.status(200).end();
});

Authentication.signin = (async (req, res) => {
    try {
        res.status(200).send({
            token: await authentication.signin(req.body.username, req.body.name, req.body.password, remoteAddress(req), req.headers['user-agent'])
                .then((result) => { return result; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        error_message = error.message === "object" ? error.obj : { message: error.message };
        Log.writeError("{0}: {1}", [error.name, error_message]);
        res.status(error.code).send(error_message);
    }
});

Authentication.signout = (async (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer || bearer.startsWith('Bearer '))
        try {
            await authentication.signout(bearer.split('Bearer ')[1].trim())
        } catch (error) {
            res.status(200).end();
        }
    res.status(200).end();
});

Authentication.signup = (async (req, res) => {
    try {
        res.status(200).send({
            status: await authentication.signup(req.body.name, req.body.username, req.body.password)
                .then((result) => { return result; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError("{0}: {1}", [error.name, error.message]);
        res.status(error.code).send({ message: error.message });
    }
});

module.exports = Authentication;