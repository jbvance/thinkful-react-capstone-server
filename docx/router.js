'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const s3 = require('./uploadToS3');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const docxTemplater = require('./docxTemplater');
const Dpoa = require('./../models/dpoa');

const jwtAuth = passport.authenticate('jwt', {session: false});

router.use(jsonParser);
router.use(jwtAuth);

//ROUTES FOR MAKING DOCX DOCUMENT
//This is the primary route for creating documents with posted data
router.post('/', async (req, res, next) => { 
  // add dpoa data to database  
 await Dpoa.create({...req.body.body, principal: req.user.id });

  // #TODO - CHECK IF EXISTS AND UPDATE INSTEAD
    
  try {
    const postResults = await docxTemplater.saveDoc(req.body);
    res.status(200).json(postResults)   
  }
  catch (err) {
      res.status(400).json(err);
  }
  
});

router.get('/:filename', (req, res, next) => {
s3.downloadFile(req.params.filename)
    .then(data => {            
        res.send(data.Body);
    })
    .catch(err => {            
        res.json(err);
    });
});

module.exports = {router};