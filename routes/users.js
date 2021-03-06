const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();
const jwt_decode = require('jwt-decode');

// Load User model
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('login', {
    redirect_url: process.env.redirect_url
  })
});

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Redirect Page
router.get('/redirect', (req, res) => res.render('redirect'));

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

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      account,
      password,
      password2
    });
  } else {
    database.ref("users").orderByChild("account").equalTo(account).once('value', e => {
      if (e.val()) {
        errors.push({ msg: 'ID already exists' });
        res.render('register', {
          errors,
          name,
          account,
          password,
          password2
        });
      } else {
        const newUser = {
          name,
          account,
          password,
          dadaCoin: 0
        };

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;

            // insert into firebase
            database.ref("users").push(newUser)
              .then(() => {
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

router.post('/loginLine', async (req, res) => {
  console.log("/loginLine");
  const { code } = req.body;

  var url = 'https://api.line.me/oauth2/v2.1/token';
  var data = `
    grant_type=authorization_code&
    code=${code}&
    redirect_uri=${process.env.redirect_url}&
    client_id=1654985474&
    client_secret=1f803414877a4b7e3ff36d917ed279be
  `
  data = data.replace(/\r\n|\n/g, "").replace(/\s+/g, "");

  axios.post(url, data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    .then( async (response) => {
      const { data } = response;
      const token = data.id_token;
      const decoded = jwt_decode(token);
      const { name, picture } = decoded;
      console.log(decoded);

      let usersRef = await database.ref("users").orderByChild("account").equalTo(name).once('value');
      let usersDocs = usersRef.val();
      if (usersDocs) {
        console.log('user exists');
      } else {
        console.log('new user');

        const newUser = {
          name: name,
          account: name,
          password: picture,
          dadaCoin: 0
        };

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            database.ref("users").push(newUser);
          });
        });

      }

      // User.findOne({ account: name }).then(user => {
      //   if (user) {
      //     console.log('user exists');
      //   } else {
      //     console.log('new user');

      //     const newUser = new User({
      //       name: name,
      //       account: name,
      //       password: picture
      //     });

      //     bcrypt.genSalt(10, (err, salt) => {
      //       bcrypt.hash(newUser.password, salt, (err, hash) => {
      //         if (err) throw err;
      //         newUser.password = hash;
      //         newUser.save();
      //       });
      //     });
      //   }
      // });

      res.send({
        name,
        picture
      });
    })
    .catch(function (error) {
      console.log('no');
      res.send('error');
    })

})

module.exports = router;
