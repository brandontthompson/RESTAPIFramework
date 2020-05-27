const router = require('express').Router();
const controller = require('./controller');

// GET
router.get('/', controller.default);
router.get('/logout', controller.signout);

// POST
router.post('/login', controller.signin);
router.post('/register', controller.signup);


module.exports = router;