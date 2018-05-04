import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { UserService } from './user.service';
import { User } from '../interfaces';
import { userProvider, databaseProvider, mockgoose } from '../providers';
import { environments } from '../utils';

const fetch: any = require('node-fetch');

describe('UserService', () => {
  let userService: UserService;
  let user: Model<User>;

  const expectedUser = {
    facebook_id: '2042621042422137',
    first_name: 'Quang',
    last_name: 'Tran',
    gender: 'male',
    timezone: 7,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      components: [UserService, databaseProvider, userProvider],
    }).compile();

    userService = module.get(UserService);
    user = module.get('UserModelToken');
    fetch.resetMocks();
  });

  afterEach(async () => {
    await mockgoose.helper.reset();
    jest.resetAllMocks();
  });

  describe('getUserByFacebookId', () => {
    test('should fetch user if not exist', async () => {
      fetch.mockImplementation(async () => ({
        json: async () => Promise.resolve({
          id: expectedUser.facebook_id,
          first_name: expectedUser.first_name,
          last_name: expectedUser.last_name,
          gender: expectedUser.gender,
          timezone: expectedUser.timezone,
        })));
      const beforeLength = await user.count({}).exec();
      const actualUser = await userService.getUserByFacebookId(expectedUser.facebook_id);
      expect(fetch.mock.calls).toMatchSnapshot();
      expect(actualUser.facebook_id).toBe(expectedUser.facebook_id);
      expect(actualUser.first_name).toBe(expectedUser.first_name);
      expect(actualUser.last_name).toBe(expectedUser.last_name);
      expect(actualUser.gender).toBe(expectedUser.gender);
      expect(actualUser.timezone).toBe(expectedUser.timezone);
      expect(await user.count({}).exec()).toEqual(beforeLength + 1);
    });

    test('should get a facebook user', async () => {
      const model = new user(expectedUser);
      await model.save();
      const beforeLength = await user.count({}).exec();
      const actualUser = await userService.getUserByFacebookId(expectedUser.facebook_id);
      expect(actualUser.facebook_id).toBe(expectedUser.facebook_id);
      expect(actualUser.first_name).toBe(expectedUser.first_name);
      expect(actualUser.last_name).toBe(expectedUser.last_name);
      expect(actualUser.gender).toBe(expectedUser.gender);
      expect(actualUser.timezone).toBe(expectedUser.timezone);
      expect(await user.count({}).exec()).toEqual(beforeLength)
    });
  });
});
