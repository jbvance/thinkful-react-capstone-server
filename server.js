const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
require('dotenv').config();

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { router: docxRouter } = require ('./docx/router');

let { PORT, DATABASE_URL } = require('./config');
if (process.env.NODE_ENV === 'test') {
  DATABASE_URL = "mongodb://localhost/react-capstone-test";
}

const app = express();

// App Setup
app.use(morgan('combined'));
// CORS
app.use(function (req, res, next) { 
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

const jwtAuth = passport.authenticate('jwt', { session: false });

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/auth/', authRouter);
app.use('/api/users/', usersRouter);
app.use('/api/dpoa', docxRouter);

// Route used by UptimeRobot.com to ping every 20 minutes
// to keep heroku app from falling asleep
app.get('/keep-alive', (req, res) => {
  res.json({
    status: 'Alive'
  })
});

let server;

function runServer() {
    return new Promise((resolve, reject) => {
  
      mongoose.connect(DATABASE_URL, { useNewUrlParser: true}, err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(PORT, () => {
            console.log(`Your app is listening on port ${PORT}`);
            resolve();
          })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      });
    });
  }
  
  function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }
  
  if (require.main === module) {
    runServer().catch(err => console.error(err));
  }
  
  module.exports = { app, runServer, closeServer };