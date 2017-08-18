const low = require('lowdb');
const { DATABASE_LOCATION } = require('./config');
const fileAsync = require('lowdb/lib/storages/file-async');
const db = low(DATABASE_LOCATION, { storage: fileAsync }); // remember to print to file

db._.mixin(require('lodash-id'));
db._.mixin({
  createId: collection =>
    collection.length === 0 ? 1 : collection[collection.length - 1].id + 1,
});

module.exports = db;
