const database = require('../db');

const db = database.get('orders');

exports.getById = function (id) {
  return Promise.resolve(db.getById(id).value());
};

exports.getAll = function () {
  return Promise.resolve(db.value());
};

exports.findWith = function (conditionObject) {
  return Promise.resolve(db.find(conditionObject).value());
}

exports.findAllWith = function (propertyObject) {
  return Promise.resolve(db.filter(propertyObject).value());
};

exports.insert = function (order) {
  return Promise.resolve(db.upsert(order).write());
};

exports.update = function (order) {
  return Promise.resolve(db.updateById(order.id, order).write())
};

exports.remove = function (orderOrId) {
  return Number.isInteger(orderOrId)
    ? db.removeById(orderOrId).write()
    : db.removeById(orderOrId.id).write();
};
