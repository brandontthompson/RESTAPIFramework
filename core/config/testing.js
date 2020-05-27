module.exports = {
    hash: {
        saltRounds: 12,
        keySalt: 8
    },
    key: {
        salt: ''
    },
    database: {
        url: 'localhost',
        user: 'root',
        password: process.env.DBPASS || '',
        schema: '',
        timeout: 10000,
        limit: 100,
        debug: false,
        multipleStatements: true,
        maxAttempts: 5,
        retryTimer: 10000,
    }
};
