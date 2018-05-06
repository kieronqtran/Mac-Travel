import { Component as Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { URL, URLSearchParams } from 'url';
import { environments } from '../utils';
import { LoggerService } from '../shared';
import { User } from '../interfaces';
// const fetch = require('node-fetch'); // bug in jest, can't mock node-fetch module if using import

@Injectable()
export class UserService {
  private readonly logger = LoggerService.create(UserService.name);

  constructor(@Inject('UserModelToken') private readonly userModel: Model<User>) {}

  async getUserByFacebookId(facebookId: string): Promise<User> {
    try {
      const foundUser = await this.userModel.findOne({ facebook_id: facebookId }).exec();
      if (foundUser) {
        this.logger.debug(`senderId ${facebookId} found return ${JSON.stringify(foundUser.toJSON())}`);
        return foundUser;
      }
      const url = new URL(`${environments.messenger.callbackUrl}/${facebookId}`);
      const params = new URLSearchParams();
      params.append('access_token', environments.messenger.accessToken);
      params.append('fields', "'first_name,last_name,timezone,gender'");
      url.search = params.toString();
      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });
      const res = await response.json();
      const user = new this.userModel({
        facebook_id: res.id,
        first_name: res.first_name,
        last_name: res.last_name,
        gender: res.gender,
        timezone: res.timezone,
      });
      this.logger.debug(`Successful get user details of { senderId: ${facebookId} }:  ${JSON.stringify(user.toJSON())}`);
      return user.save();
    } catch (error) {
      this.logger.error(`Error getting details for { senderId: ${facebookId} }`, error);
    }
  }
}
