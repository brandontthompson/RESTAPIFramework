const APIError = require('../../core/APIError');
const Log = require('../../core/logger/Log');
const mysql = require('../../core/database/query');
const authentication = require('../../core/authentication').jsonwebtoken;
const authenticationError = require('../../core/authentication/authenticationError');
const authenticationCode = require('../../core/authentication/authenticationCode');
const User = require('../user/user');

class Authentication {
    static async signin(username, password, address, header) {
        let results = null;

        if (typeof username !== "string" || typeof password !== "string" || !password || !username)
            throw new APIError(authenticationCode.badRequest, authenticationError.missing);

        try {
            results = await mysql.select(['user_password', 'user_name'], 'user', ['user_name', '=', username]);

            if (results.data.count === 0) {
                await this.signup(username, password, address);
                return await this.signin(username, password, address, header);
            }

        } catch (error) {
            Log.writeError(error.message);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }

        if (results.data === null || results.data.records.length !== 1) throw new APIError(authenticationCode.unauthorized, authenticationError.invalid);

        const match = await User.verifyPassword(password, results['data']['records'][0].user_pin)
            .catch((error) => {
                Log.writeError(error.message);
                throw new APIError(authenticationCode.unauthorized, authenticationError.invalid);
            })
            .then((results) => { return results; });

        if (!match) throw new APIError(authenticationCode.unauthorized, authenticationError.invalid);

        try {
            await mysql.insert('login', {
                user_id: username,
                address: address,
                agent: header,
            });

            let banned = (await mysql.q("SELECT ban_id,ban_message,ban_expire_date,ban_created_date \
                FROM `ban` \
                WHERE ( ban_user_id = ? OR ban_address = ? ) AND ( DATE(ban_expire_date) >= CURDATE() OR ban_expire_date IS NULL )",
                [username, address]));

            if (banned.data.records.length > 0)
                throw new APIError(authenticationCode.unauthorized, "object", {
                    ban_created: banned.data.records[0].ban_created_date,
                    ban_id: banned.data.records[0].ban_id,
                    ban_reason: banned.data.records[0].ban_message,
                    ban_expire: banned.data.records[0].ban_expire_date
                });

            await mysql.update('user', { status: 1 }, ['user_id', '=', username]);

        } catch (error) {
            Log.writeError(error);
            throw (error.code ? error : new APIError(authenticationCode.internal, authenticationError.internal));
        }

        return await authentication.issue(results['data']['records'][0].user_id)
            .catch((error) => {
                Log.writeError(error.message);
                throw new APIError(authenticationCode.internal, authenticationError.internal);
            });
    }

    static async signup(username, password, remoteAddress = null) {
        if (typeof username !== "string" || typeof password !== "string" || !username || !password)
            throw new APIError(authenticationCode.badRequest, authenticationError.missing);

        try {
            return User.register(username, password, remoteAddress)
                .then((result) => { return "Ok"; })
                .catch((error) => { throw new APIError(authenticationCode.badRequest, authenticationError.exists); });
        } catch (error) {
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async signout(token) {
        await mysql.update('user', { status: 0 }, ['user_id', '=', (await authentication.payload(token)).user_id]);
        await authentication.destroy(token);
    }
}

module.exports = Authentication;