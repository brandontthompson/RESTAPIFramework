const morgan = require('morgan');
const bodyParser = require('body-parser');

module.exports = function (app) {
    app.disable('x-powered-by');
    app.enable('trust proxy');
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
}