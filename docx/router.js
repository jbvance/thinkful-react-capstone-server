'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const jsonParser = bodyParser.json();

// ROUTES FOR MAKING DOCX DOCUMENT
// This is the primary route for creating documents with posted data
// router.post('/api/makedoc', jsonParser, catchErrors(async (req, res, next) => { 
//   //console.log("REQUEST BODY", req.body)      
//   const postResults = await docxTemplater.saveDoc(req.body);
//   res.status(200).json(postResults)   
// }));

router.post('/test', jsonParser, function(req, res) {
    res.json(req.body);
});
    
router.get('/download/:filename', jsonParser, (req, res, next) => {
s3.downloadFile(req.params.filename)
    .then(data => {            
        res.send(data.Body);
    })
    .catch(err => {            
        res.json(err);
    });
});

module.exports = {router};