const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

global.orderId = 3;

// Dashboard
router.get('/',async (req, res) =>{
  var userCount = await User.find({}).countDocuments()
  
  res.render('index', {
    orderId,
    userCount
  })
});

router.get('/orderId', (req, res) => {
  res.send({
    orderId
  })
})

module.exports = router;
