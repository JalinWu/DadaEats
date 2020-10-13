const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'account' }, (account, password, done) => {

      // firebase
      database.ref("users").orderByChild("account").equalTo(account).once('value', e => {
        let dataObj = e.val();
        let user = "";
        for (let i in dataObj) {
          user = dataObj[i];
        }

        if (user) {
          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          });
        } else {
          return done(null, false, { message: 'That account is not registered' });
        }
      });

      // Match user
      // User.findOne({
      //   account: account
      // }).then(user => {
      //   if (!user) {
      //     return done(null, false, { message: 'That account is not registered' });
      //   }

      //   // Match password
      //   bcrypt.compare(password, user.password, (err, isMatch) => {
      //     if (err) throw err;
      //     if (isMatch) {
      //       return done(null, user);
      //     } else {
      //       return done(null, false, { message: 'Password incorrect' });
      //     }
      //   });
      // });
    })
  );

  passport.serializeUser(function (user, done) {
    // done(null, user.id);
    done(null, user.account);
  });

  passport.deserializeUser(function (account, done) {

    database.ref("users").orderByChild("account").equalTo(account).once('value', e => {
      let dataObj = e.val();
      let user = "";
      for (let i in dataObj) {
        user = dataObj[i];
      }
      
      done(null, user);
    });

    // User.findById(id, function (err, user) {
    //   done(err, user);
    // });
  });
};
