const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, account, password, password2 } = req.body;
  let errors = [];

  if (!name || !account || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      account,
      password,
      password2
    });
  } else {
    User.findOne({ account: account }).then(user => {
      if (user) {
        errors.push({ msg: 'ID already exists' });
        res.render('register', {
          errors,
          name,
          account,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          account,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});


// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

router.get('/auth', ensureAuthenticated, (req, res) => {
  console.log('Sombody is authorized');

  const { name, account } = req.user;
  const user = { name, account };

  res.send(user);
})

router.get('/dadaCoin', ensureAuthenticated, (req, res) => {
  res.render('dadacoin', {
    dadaCoin: req.user.dadaCoin
  })
})

module.exports = router;
