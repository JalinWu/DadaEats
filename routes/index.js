const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// global.orderId = 3;

// Dashboard
router.get('/',async (req, res) =>{
  var userCount = await User.find({}).countDocuments()
  var getGroup = await Group.findOne({ status: 'open' })
  var groupId;
  (getGroup) ? groupId = getGroup.groupId : groupId = 0
  
  res.render('index', {
    groupId,
    userCount
  })
});

router.get('/groupId', async (req, res) => {
  var getGroup = await Group.findOne({ status: 'open' })
  res.send({
    groupId: getGroup.groupId
  })
})

module.exports = router;
