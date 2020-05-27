const Log = require('../../core/logger/Log')
const simpleQuery = require('./SimpleQuery');

const SimpleQuery = ((SimpleQuery) => {
    this.SimpleQuery = SimpleQuery;
});

SimpleQuery.get = (async (req, res) => {
    try {
        res.status(200).send(
            await simpleQuery.get()
                .then((result) => {
                    return result.data.records;
                })
                .catch((error) => { throw error; })
        );
    } catch (error) {
        Log.writeError(error)
        res.status(error.code).send({ message: error.message });
    }
});

SimpleQuery.advanced = (async (req, res) => {
    try {
        res.status(200).send(
            await simpleQuery.advanced()
                .then((result) => {
                    return result.data.records;
                })
                .catch((error) => { throw error; })
        );
    } catch (error) {
        Log.writeError(error)
        res.status(error.code).send({ message: error.message });
    }
});


module.exports = SimpleQuery;