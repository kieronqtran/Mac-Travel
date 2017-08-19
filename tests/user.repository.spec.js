const userRepository = require('../repository/user.repository');

describe.skip('Users Repository', () => {
  it('should get a user', () => {
    const expectedUser = {
      facebookId: '2042621042422137',
      firstName: 'Quang',
      lastName: 'Tran',
      gender: 'male',
      timezone: 7,
    };
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
