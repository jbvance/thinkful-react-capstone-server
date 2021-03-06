'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();

const { createAuthToken} = require('../utils');

const localAuth = passport.authenticate('local', {session: false});
// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false })) 
// parse application/json
router.use(bodyParser.json());

// The user provides an email and password to login
router.post('/login', localAuth, (req, res) => {  
  const authToken = createAuthToken(req.user.serialize());
  res.json({authToken});
});

const jwtAuth = passport.authenticate('jwt', {session: false});

// The user exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

module.exports = {router};