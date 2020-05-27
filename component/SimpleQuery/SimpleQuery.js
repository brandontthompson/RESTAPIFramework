const APIError = require('../../core/APIError');
const Log = require('../../core/logger/Log');
const mysql = require('../../core/database/query');
const authenticationError = require('../../core/authentication/authenticationError');
const authenticationCode = require('../../core/authentication/authenticationCode');

class SimpleQuery {

    static async get() {
        try {
            return await mysql.select([], '', []);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async advanced() {
        try {
            return await mysql.query("SELECT TableA.firstName,TableA.lastName,TableB.age,TableB.Place\
                                    FROM TableA\
                                    INNER JOIN TableB\
                                    ON TableA.id = TableB.id2;");
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }
}

module.exports = SimpleQuery;