const connectionPool = require('./connection');
const Log = require('../logger/Log');
const config = require('../config');

connectionPool.query = async function (query, value) {
    try {
        return new Promise((resolve, reject) => {

            connectionPool.query(query, value, (error, rows, fields) => {
                if (error) reject(error);
                else {
                    const response = {
                        result: !error,
                        query,
                        data: {
                            count: rows.length,
                            records: rows,
                            fields
                        }
                    }
                    if (config.database.debug)
                        console.log(response);

                    resolve(response);
                }
            });
        }).catch((error) => {
            Log.writeError(error);
            throw new Error(error);
        });
    } catch (error) {
        Log.writeError("Database error code: {0}", error.code);
        throw new Error(error);
    }
}

connectionPool.action = function (action, table, where) {
    if (typeof where[0] === 'string' && where.length != 3)
        return null;
    let operator = [];
    let value = [];

    let query = action + " FROM `" + table + "` WHERE ";

    if (typeof where[0] === "object") {

        where.forEach((entry, index) => {
            query += entry[0] + " " + entry[1] + " ?";
            operator.push(entry[1])
            value.push(entry[2]);
            if (index !== where.length - 1)
                query += " AND "
        });

    } else {
        value.push(where[2]);
        operator.push(where[1]);
        query += where[0] + " " + where[1] + " ?"
    }
    try {

        return connectionPool.q(query, [...value]);
    } catch (error) {
        Log.writeError("Database error", error);
        throw new Error(500);
    }

}

connectionPool.newest = function (fields, table, limit = 1, max = null, _as = max, group = '()') {
    try {
        return new Promise((resolve, reject) => {
            let query = 'SELECT ' + fields + ' FROM ' + table + ' ORDER BY ' + table + '_id' + ' DESC LIMIT ' + limit
            if (max) {
                query = 'SELECT ' + fields + ' MAX(' + max + ') AS ' + _as + ' FROM ' + table + ' GROUP BY ' + group
            }
            this.query(query);
        }).catch(error => {
            Log.writeError(error);
        });
    } catch (error) {
        Log.writeError("Database error code: {0}", error.code);
        throw new Error(error.code);
    }
}

connectionPool.get = function (table, where) {
    try {
        return this.action('SELECT *', table, where).then(result => {
            return result;
        }).catch((error) => {
            Log.writeError("Database error code: {0}", error.code);
            throw error;
        });
    } catch (error) {
        Log.writeError("Database error code: {0}", error.code);
        throw error;
    }
}

// TODO FIX
connectionPool.exists = function (table, where, and) {
    result = this.action('SELECT COUNT(*)', table, where, and).then(result => {
        return result;
    }).catch(error => {
        Log.writeError(error);
    });
    // 
    if (result > 0) {
        return true;
    }
    return false;
}

connectionPool.count = function (table, where) {
    try {
        return this.action('SELECT COUNT(*) ', table, where)
            .then((result) => {
                return result.data.records[0]['COUNT(*)'];
            }).catch((error) => {
                throw error;
            });
    } catch (error) {
        Log.writeError("Database error code: {0}", error.code);
        throw error;
    }
}

connectionPool.select = function (fields, table, where) {
    try {
        return this.action('SELECT ' + fields, table, where).then(result => {
            return result;
        }).catch((error) => {
            throw error;
        });
    } catch (error) {
        Log.writeError("Database error code: {0}", error.code);
        throw error;
    }
}


// connectionPool.leftJoin = function () {
//     try {

//     }
// }

connectionPool.delete = function (table, where) {
    try {
        return this.action('DELETE', table, where).then(result => {
            return result;
        }).catch((error) => {
            throw error
        });
    } catch (error) {
        Log.writeError("Database error code: {0}", error.code);
        throw error;
    }
}

connectionPool.insert = async function (table, fields) {
    let binds = [
        [],
        []
    ]
    Object.entries(fields).forEach(entry => {
        binds[0].push(table + "_" + entry[0]);
        binds[1].push(entry[1]);
    });

    try {
        const query = 'INSERT INTO `' + table + '` (??) VALUES (?)';
        return this.query(query, [binds[0], binds[1]]);
    } catch (error) {
        Log.writeError("Database error code: {0}", error.code);
        throw new Error(error.code);
    }
}

connectionPool.update = function (table, fields, where) {
    let binds = []
    let vars = []

    Object.entries(fields).forEach(entry => {
        binds.push(table + "_" + entry[0]);
        vars.push(entry[1]);
    });

    const operators = ['=', '>', '<', '>=', '<='];
    let field;
    let operator;
    let value = [];

    let query = "UPDATE " + table + " SET ";

    binds.forEach((bind, index) => {
        query += bind + " = ?";
        if (index !== binds.length - 1)
            query += ","
    });

    query += " WHERE ";

    if (typeof where[0] === "string" && where.length === 3) {

        value.push(where[2]);
        query += where[0] + " " + where[1] + " ?"

    } else if (typeof where[0] === "object") {

        where.forEach((entry, index) => {
            query += entry[0] + " " + entry[1] + " ?";
            value.push(entry[2]);
            if (index !== where.length - 1)
                query += " AND "
        });

    } else {

        field = 1;
        operator = "=";
        value.push(1);
        query += field + " " + operator + " ?"

    }

    try {
        return this.query(query, [...vars, ...value]);

    } catch (error) {
        Log.writeError("Database error code: {0}", error.code);
        throw new Error(error.code);
    }
}

module.exports = connectionPool;