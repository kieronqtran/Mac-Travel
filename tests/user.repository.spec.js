const userRepository = require('../repository/user.repository');
const db = require('../db').get('users');
const util = require('./util/util');
const {expect} = require('chai');

describe('Users Repository', () => {
  const expectedUser = {
    facebookId: '2042621042422137',
    firstName: 'Quang',
    lastName: 'Tran',
    gender: 'male',
    timezone: 7,
  };

  beforeEach(() => {
    util.flushDb();
  });
  afterEach(() => {
    util.flushDb();
  });

  test.skip('should fetch user if not exist', () => {
    return db
      .removeWhere({facebook_id: expectedUser.facebookId})
      .write()
      .then(() =>
        expect(
          db.find({facebook_id: expectedUser.facebookId}).value()
        ).toBeUndefined()
      )
      .then(() => userRepository.getUserByFacebookId(expectedUser.facebookId))
      .then(actualUser => {
        expect(actualUser.facebook_id).toBe(expectedUser.facebookId);
        expect(actualUser.first_name).toBe(expectedUser.firstName);
        expect(actualUser.last_name).toBe(expectedUser.lastName);
        expect(actualUser.gender).toBe(expectedUser.gender);
        expect(actualUser.timezone).toBe(expectedUser.timezone);
      });
  });

  test.skip('should get a user', () => {
    return userRepository
      .getUserByFacebookId('2042621042422137')
      .then(actualUser => {
        expect(actualUser.facebook_id).toBe(expectedUser.facebookId);
        expect(actualUser.first_name).toBe(expectedUser.firstName);
        expect(actualUser.last_name).toBe(expectedUser.lastName);
        expect(actualUser.gender).toBe(expectedUser.gender);
        expect(actualUser.timezone).toBe(expectedUser.timezone);
      });
  });
});
