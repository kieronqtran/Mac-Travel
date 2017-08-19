const low = require('lowdb');
const { DATABASE_LOCATION, environments } = require('./config');
const dbJson = require('./db.json');
const fileAsync = require('lowdb/lib/storages/file-async');

const location = environments.test ? 'db.test.json' : DATABASE_LOCATION;

const db = low(location, { storage: fileAsync }); // remember to print to file

if (environments.test) {
  db.defaults(dbJson).write();
}

db._.mixin(require('lodash-id'));
db._.mixin({
  createId: collection =>
    collection.length === 0 ? 1 : collection[collection.length - 1].id + 1,
});

module.exports = db;
