const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getChatbot
router.get('/getChatbot', ensureAuthenticated, (req, res) => {
    res.render('chatbot', {})
});

module.exports = router;