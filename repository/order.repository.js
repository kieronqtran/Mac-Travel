const database = require('../db');

const db = database.get('orders');

exports.getById = function(id) {
  return db.getById(id).value();
};

exports.getAll = function() {};

exports.findAllWith = function(propertyObject) {};

exports.insert = function(order) {};

exports.update = function(order) {};

exports.remove = function(orderOrId) {
  Number.isInteger(orderOrId)
    ? db.removeById(orderOrId).write()
    : db.removeById(orderOrId.id).write();
};
