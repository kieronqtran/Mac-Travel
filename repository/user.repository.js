const { PAGE_ACCESS_TOKEN } = require('../config');
const database = require('../db');
const rp = require('request-promise-native');

const db = database.get('users');

exports.getUserById = function (id) {
  const user = db.getById(id).value();
  return user;
};

exports.getUserByFacebookId = function (senderId) {
  const user = db.find({ facebook_id: senderId }).value();
  if (user) {
    return Promise.resolve(user);
  } else {
    return rp.get({
      url: 'https://graph.facebook.com/v2.9/' + senderId,
      qs: {
        access_token: PAGE_ACCESS_TOKEN,
        fields: 'first_name,last_name,timezone,gender',
      },
      json: true,
    }).then(res => ({
      facebook_id: res.id,
      first_name: res.first_name,
      last_name: res.last_name,
      gender: res.gender,
      timezone: res.timezone,
    })).then(user => db.upsert(user).write());
  }
};

exports.updateOrInsertByFacebookId = function (senderId) {
  return rp
    .get({
      url: 'https://graph.facebook.com/v2.9/' + senderId,
      qs: {
        access_token: PAGE_ACCESS_TOKEN,
        fields: 'first_name,last_name,timezone,gender',
      },
      json: true,
    })
    .then(res => {
      return {
        facebook_id: res.id,
        first_name: res.first_name,
        last_name: res.last_name,
        gender: res.gender,
        timezone: res.timezone,
      };
    })
    .then(user => {
      db.updateWhere({ facebook_id: senderId }, user).write();
      return user;
    })
    .catch(err => console.error(err));
};
