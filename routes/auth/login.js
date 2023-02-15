const express = require('express');
const router = express.Router();

//* Login GET route
//* Render login with recaptcha
router.get('/login', (req, res, next) => {
  res.render('./auth/login');
});

//* Retry_login GET route
//* Render retry-login template with recaptcha
router.get('/retry_login', (req, res, next) => {
  res.render('./auth/retry-login');
});

module.exports = router;