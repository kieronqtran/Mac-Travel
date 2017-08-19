const dbJson = require('../../db.json');
const db = require('../../db');
exports.flushDb = function () {
  db.setState(dbJson);
}
