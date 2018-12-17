'use strict';
global.DATABASE_URL = 'mongodb://localhost/link-saver-test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('/api/user', function() {
  const email = 'exampleUser@example.com';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  const usernameBEmail = 'exampleUserB@example.com';
  const passwordB = 'examplePassB';
  const firstNameB = 'ExampleB';
  const lastNameB = 'UserB';

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {});

  afterEach(function() {
    return User.remove({});
  });

  describe('/api/users', function() {
    describe('POST', function() {
      it('Should reject users with missing email', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            password,
            firstName,
            lastName
          })
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
            expect(res.body.location).to.equal('email');
          });
      });

      it('Should reject users with missing password', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            email,
            firstName,
            lastName
          })
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
            expect(res.body.location).to.equal('password');
          });
      });     

      it('Should reject users with non-string email', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            email: 1234,
            password,
            firstName,
            lastName
          })
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
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('email');
          });
      });

      it('Should reject users with non-string password', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            email,
            password: 1234,
            firstName,
            lastName
          })
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
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('password');
          });
      });  

      it('Should reject users with non-trimmed password', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            email,
            password: ` ${password} `,
            firstName,
            lastName
          })
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
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('password');
          });
      });

      it('Should reject users with empty email', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            email: '',
            password,
            firstName,
            lastName
          })
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
            expect(res.body.message).to.equal(
              'email must be at least 5 characters long'
            );
            expect(res.body.location).to.equal('email');
          });
      });

      it('Should reject users with password less than ten characters', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            email,
            password: '123456789',
            firstName,
            lastName
          })
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
            expect(res.body.message).to.equal(
              'password must be at least 10 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });

      it('Should reject users with password greater than 72 characters', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            email,
            password: new Array(73).fill('a').join(''),
            firstName,
            lastName
          })
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
            expect(res.body.message).to.equal(
              'password must be at most 72 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });

      it('Should reject users with duplicate email', function() {
        // Create an initial user
        return User.create({
          email,
          password,
          firstName,
          lastName
        })
          .then(() =>
            // Try to create a second user with the same username
            chai.request(app).post('/api/users').send({
              email,
              password,
              firstName,
              lastName
            })
          )
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
            expect(res.body.message).to.equal(
              'Email already taken'
            );
            expect(res.body.location).to.equal('Email');
          });
      });

      it('Should create a new user', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            email,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'user',
              'authToken'
            );
            expect(res.body.user.email).to.equal(email.toLowerCase());
            expect(res.body.user.firstName).to.equal(firstName);
            expect(res.body.user.lastName).to.equal(lastName);
            return User.findOne({
              email
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
            return user.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });

      it('Should trim firstName and lastName', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            email,
            password,
            firstName: ` ${firstName} `,
            lastName: ` ${lastName} `
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
             'user',
             'authToken'
            );
            expect(res.body.user.email).to.equal(email.toLowerCase());
            expect(res.body.user.firstName).to.equal(firstName);
            expect(res.body.user.lastName).to.equal(lastName);
            return User.findOne({
              email
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
          });
      });

    });   
  });
});