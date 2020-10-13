const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// global.orderId = 3;

// Dashboard
router.get('/', async (req, res) => {
  let usersRef = await database.ref("users").once('value');
  let usersDocs = usersRef.val();
  let usersCount = 0;
  if (usersDocs) {
    usersCount = Object.keys(usersDocs).length;
  }

  let groupsRefforIndexOn = await database.ref("groups").orderByChild("groupId").equalTo("").once('value');
  let groupsRef = await database.ref("groups").orderByChild("status").equalTo("open").once('value');
  let groupsDocs = groupsRef.val();
  let groupId = 0;
  for(let i in groupsDocs) {
    groupId = groupsDocs[i].groupId;
  }

  // var userCount = await User.find({}).countDocuments()
  // var getGroup = await Group.findOne({ status: 'open' })
  // var groupId;
  // (getGroup) ? groupId = getGroup.groupId : groupId = 0

  res.render('index', {
    groupId,
    usersCount
  })
});

router.get('/groupId', async (req, res) => {
  let groupsRefforIndexOn = await database.ref("groups").orderByChild("groupId").equalTo("").once('value');
  let groupsRef = await database.ref("groups").orderByChild("status").equalTo("open").once('value');
  let groupsDocs = groupsRef.val();
  let groupId = 0;
  for(let i in groupsDocs) {
    groupId = groupsDocs[i].groupId;
  }

  // var getGroup = await Group.findOne({ status: 'open' })
  // var groupId = getGroup.groupId;
  res.send({
    groupId
  })
})

module.exports = router;
