const express = require('express');
const expressLayouts = require('express-ejs-layouts');
// const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();
const firebase = require('firebase/app');
require('firebase/database');

const opt = { 
  databaseURL: `https://dadaeats.firebaseio.com`
};
const fbapp = firebase.initializeApp(opt); // firebase 初始化
global.database = fbapp.database();

const app = express();

app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
// mongoose
//   .connect(
//     db,
//     { 
//       useUnifiedTopology: true,
//       useNewUrlParser: true ,
//       useFindAndModify: false
//     }
//   )
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/menu', require('./routes/menu.js'));
app.use('/cart', require('./routes/cart.js'));
app.use('/dashboard', require('./routes/dashboard.js'));
app.use('/chatbot', require('./routes/chatbot.js'));
app.use('/profile', require('./routes/profile.js'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
