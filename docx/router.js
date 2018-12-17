'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const s3 = require('./uploadToS3');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const docxTemplater = require('./docxTemplater');
const Dpoa = require('./model');

const jwtAuth = passport.authenticate('jwt', {session: false});

router.use(jsonParser);

//ROUTE FOR MAKING DOCX DOCUMENT
//This is the primary route for creating documents with posted data
router.post('/', jwtAuth, async (req, res, next) => { 
   try {
    const requiredFields = ['fullName', 'address', 'agents', 'effectiveNow'];
    const missingField = requiredFields.find(field => !(field in req.body));
  
    if (missingField) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing field',
        location: missingField
      });
    }
      
    const stringFields = ['fullName', 'address'];    
    const nonStringField = stringFields.find(
      field => field in req.body && typeof req.body[field] !== 'string'
    );
  
    if (nonStringField) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Incorrect field type: expected string',
        location: nonStringField
      });
    }  

    //select options come in as string, so check if equal to "true" or "false"
    const booleanFields = ['effectiveNow'];    
    const nonBooleanField = booleanFields.find(
      field => field in req.body && req.body[field] !== 'true' && req.body[field] !== 'false'
    );
  
    if (nonBooleanField) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Incorrect field type: expected boolean',
        location: nonBooleanField
      });
    } 

   if (req.body['effectiveNow'] === 'true') {
     req.body['effectiveNow'] = true;
   } else if (req.body['effectiveNow'] === 'false') {
     req.body['effectiveNow'] = false;
   }
    

      // add dpoa data to database  
    await Dpoa.findOneAndUpdate(
        { principal: req.user.id }, 
        {...req.body, principal: req.user.id }, 
        { new: true, upsert: true, setDefaultsOnInsert: true }).exec();
    
    // Now create the .docx document and save it to AWS S3 bucket
    const postResults = await docxTemplater.saveDoc(req.body);
    res.status(200).json(postResults)   
  }
  catch (err) {
      res.status(400).json(err);
  }  
});

// Get the Dpoa data for an existing user
router.get('/:userId', jwtAuth, async (req, res, next) => {    
  
  try {  

    let returnData = {};

    if (!req.params.userId) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing field',
        location: 'id'
      });
    }  
      // add dpoa data to database  
    let dpoaData = await Dpoa.findOne({ principal: req.params.userId });
    if (!dpoaData) {
      returnData = {}
    } else {
      returnData = {
        fullName: dpoaData.fullName,
        address: dpoaData.address,
        agents: dpoaData.agents,
        effectiveNow: dpoaData.effectiveNow
      };
    }
    res.status(200).json(returnData);  
  }
  catch (err) {
      res.status(400).json(err);
  }  
});

router.get('/files/:filename', (req, res, next) => {
s3.downloadFile(req.params.filename)
    .then(data => {            
        res.send(data.Body);
    })
    .catch(err => {            
        res.json(err);
    });
});

module.exports = {router};