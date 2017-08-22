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

exports.getUncheckedoutOrder = function (senderId) {
  return Promise.resolve(db.find(o => o.order_user.facebook_id === senderId && !o.checkouted).value());
}

exports.insert = function (order) {
  order.createdTime = Date.now();
  order.updatedTime = Date.now();
  return Promise.resolve(db.upsert(order).write());
};

exports.update = function (order) {
  order.updatedTime = Date.now();
  return Promise.resolve(db.updateById(order.id, order).write())
};

exports.remove = function (orderOrId) {
  return Number.isInteger(orderOrId)
    ? Promise.resolve(db.removeById(orderOrId).write())
    : Promise.resolve(db.removeById(orderOrId.id).write());
};

