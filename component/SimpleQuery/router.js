const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.get);

router.route('/advanced')
    .get(controller.advanced);

module.exports = router;