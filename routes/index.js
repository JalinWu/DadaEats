const express = require('express');
const router = express.Router();
const path = require('path')
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Dashboard
router.get('/', (req, res) =>{
  res.render('index', {
    orderId: 1
  })
});

module.exports = router;
