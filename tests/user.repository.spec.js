const userRepository = require('../repository/user.repository');
const db = require('../db').get('users');
const util = require('./util/util');
const { expect } = require('chai');

describe('Users Repository', () => {

  const expectedUser = {
    facebookId: '2042621042422137',
    firstName: 'Quang',
    lastName: 'Tran',
    gender: 'male',
    timezone: 7,
  };

  beforeEach(() => { util.flushDb() });
  afterEach(() => { util.flushDb() });

  it.skip('should fetch user if not exist', () => {
    return db.removeWhere({ facebook_id: expectedUser.facebookId }).write()
      .then(() =>
        expect(db.find({ facebook_id: expectedUser.facebookId }).value()).to.be.undefined
      )
      .then(() => userRepository.getUserByFacebookId(expectedUser.facebookId))
      .then(actualUser => {
        actualUser.facebook_id.should.equal(expectedUser.facebookId);
        actualUser.first_name.should.equal(expectedUser.firstName);
        actualUser.last_name.should.equal(expectedUser.lastName);
        actualUser.gender.should.equal(expectedUser.gender);
        actualUser.timezone.should.equal(expectedUser.timezone);
      })
  });

  it('should get a user', () => {
    return userRepository
      .getUserByFacebookId('2042621042422137')
      .then(actualUser => {
        actualUser.facebook_id.should.equal(expectedUser.facebookId);
        actualUser.first_name.should.equal(expectedUser.firstName);
        actualUser.last_name.should.equal(expectedUser.lastName);
        actualUser.gender.should.equal(expectedUser.gender);
        actualUser.timezone.should.equal(expectedUser.timezone);
      });
  });
});
