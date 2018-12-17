'use strict';
global.DATABASE_URL = 'mongodb://localhost/react-capstone-test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { Dpoa } = require('../docx/model');
const { JWT_SECRET } = require('../config');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Dpoa endpoints', function() {
  const email = 'exampleUser@test.com';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  const id = mongoose.Types.ObjectId();

  const token = jwt.sign(
    {
      user: {
        email,
        firstName,
        lastName,
        id
      }
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: email,
      expiresIn: '7d'
    }
  );  

  // Sample request body that can be modified as needed to send test body
  let requestBody = {};

  before(function () {
    return runServer();
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function() {
    requestBody = {
        fullName: "Jason B. Vance",
        address: "1234 Main St., Katy, TX 77458",
        agents: [
            {
                address: "9876 Main St., Tulsa, OK 74057",
                fullName: "Jay Vance"
            },
            {
                address: "1234 Main St., Houston, TX 77002",
                fullName: "Mindy Vance"
            }
        ],
        effectiveNow: "true"
    }
    return User.hashPassword(password).then(password =>
      User.create({
        email,
        password,
        firstName,
        lastName,
        _id: id
      })
    );   
  });

  afterEach(function () {
    return User.remove({});
  });

  it('Should reject requests with no credentials', function () {
    return chai
      .request(app)
      .post('/api/dpoa')
      .then((res) =>{            
          expect.fail(null, null, 'Request should not succeed');
      }           
       
      )
      .catch(err => {         
        if (err instanceof chai.AssertionError) {
          console.log("ERROR", err);
          throw err;
        }
        const res = err.response;
        expect(res).to.have.status(401);
      });
  });
  it ('should not add a dpoa without fullName', function() {        
    delete requestBody['fullName'];          
    return chai
      .request(app)
      .post('/api/dpoa')
      .set('authorization', `Bearer ${token}`)
      .send(requestBody)                  
      .then(() =>
        expect.fail(null, null, 'Request should not succeed')
      )
      .catch(err => {
        if (err instanceof chai.AssertionError) {
          throw err;
        }

        const res = err.response;
        expect(res).to.have.status(422);
        expect(res.body.reason).to.equal('ValidationError');
        expect(res.body.message).to.equal('Missing field');
        expect(res.body.location).to.equal('fullName');
      });
  });

  it ('should not add a dpoa without address', function() {        
    delete requestBody['address'];          
    return chai
      .request(app)
      .post('/api/dpoa')
      .set('authorization', `Bearer ${token}`)
      .send(requestBody)                  
      .then(() =>
        expect.fail(null, null, 'Request should not succeed')
      )
      .catch(err => {
        if (err instanceof chai.AssertionError) {
          throw err;
        }

        const res = err.response;
        expect(res).to.have.status(422);
        expect(res.body.reason).to.equal('ValidationError');
        expect(res.body.message).to.equal('Missing field');
        expect(res.body.location).to.equal('address');
      });
  });

  it ('should not add a dpoa without agents', function() {        
    delete requestBody['agents'];          
    return chai
      .request(app)
      .post('/api/dpoa')
      .set('authorization', `Bearer ${token}`)
      .send(requestBody)                  
      .then(() =>
        expect.fail(null, null, 'Request should not succeed')
      )
      .catch(err => {
        if (err instanceof chai.AssertionError) {
          throw err;
        }

        const res = err.response;
        expect(res).to.have.status(422);
        expect(res.body.reason).to.equal('ValidationError');
        expect(res.body.message).to.equal('Missing field');
        expect(res.body.location).to.equal('agents');
      });
  });

  it ('should not add a dpoa without effectiveNow', function() {        
    delete requestBody['effectiveNow'];          
    return chai
      .request(app)
      .post('/api/dpoa')
      .set('authorization', `Bearer ${token}`)
      .send(requestBody)                  
      .then(() =>
        expect.fail(null, null, 'Request should not succeed')
      )
      .catch(err => {
        if (err instanceof chai.AssertionError) {
          throw err;
        }

        const res = err.response;
        expect(res).to.have.status(422);
        expect(res.body.reason).to.equal('ValidationError');
        expect(res.body.message).to.equal('Missing field');
        expect(res.body.location).to.equal('effectiveNow');
      });
  });

  it ('should not add a dpoa if effectiveNow is NOT boolean', function() {        
    requestBody['effectiveNow'] = 'notbool';          
    return chai
      .request(app)
      .post('/api/dpoa')
      .set('authorization', `Bearer ${token}`)
      .send(requestBody)                  
      .then(() =>
        expect.fail(null, null, 'Request should not succeed')
      )
      .catch(err => {
        if (err instanceof chai.AssertionError) {
          throw err;
        }

        const res = err.response;
        expect(res).to.have.status(422);
        expect(res.body.reason).to.equal('ValidationError');
        expect(res.body.message).to.equal('Incorrect field type: expected boolean');
        expect(res.body.location).to.equal('effectiveNow');
      });
  });

});

