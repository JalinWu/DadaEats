const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

global.orderId = 2;

// Dashboard
router.get('/', (req, res) =>{
  res.render('index', {
    orderId
  })
});

router.get('/orderId', (req, res) => {
  res.send({
    orderId
  })
})

module.exports = router;
