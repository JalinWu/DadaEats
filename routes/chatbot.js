const express = require('express');
const router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs')
const User = require('../models/User');
const Order = require('../models/Order');
const Group = require('../models/Group');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getChatbot
router.get('/getChatbot', ensureAuthenticated, (req, res) => {
    res.render('chatbot', {})
});

module.exports = router;