const express = require('express');
const router = express.Router();

//* Home GET route (for logged-in users) - Displays list of all active exclusions
router.get('/home', async (req, res, next) => {
  res.render('home');
});

module.exports = router;
