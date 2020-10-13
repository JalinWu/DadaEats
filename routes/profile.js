const express = require('express');
const router = express.Router();

// getProfile
router.get('/getProfile',async (req, res) =>{
  
  res.render('profile', {
  })
});

module.exports = router;