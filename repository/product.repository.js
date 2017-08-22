const database = require('../db');

const productTable = database.get('products');

/**
 * Product: {
      "id": Number - Product Id,
      "name": String - Product Name,
      "type": String - Product Type (only Burger or Drink),
      "item_url": String - Item Url,
      "image_url": String - Image Url,
      "unit_price": Number Price per product,
      "concurrency": String - Concurrent of Unit Price,
      "description": String - The description of product,
      "payload_name": String - The payload name
    }
 */

/**
  * return <Product>[] list of burgers
  */
exports.getAllBurgers = function () {
  const burgers = productTable.filter(e => e.type === 'Burger').value();
  return burgers;
};

/**
  * return <Product>[] list of drinks
  */
exports.getAllDrinks = function () {
  const burgers = productTable.filter(e => e.type === 'Drink').value();
  return burgers;
};

/**
  * return <Product>[] list of all food
  */
exports.getAllProducts = function () {
  return productTable.value();
};

/**
  * return <Product>[] list of payload name
  */
exports.getAllPayLoads = function () {
  return productTable.value().map(p => p.payload_name);
};

exports.findProductById = function (id) {
  return productTable.find({ id: id }).value();
};

exports.findDrinkById = function (id) {
  return productTable.find({ id: id, type: 'Drink' }).value();
};

exports.findBurgerById = function (id) {
  return productTable.find({ id: id, type: 'Burger' }).value();
};

exports.getProductByNameAndType = function (name, type) {
  const product = productTable.find({ name, type }).value();
  return product;
};

exports.getProductById = function (id) {
  const product = productTable.find({ id }).value();
  return product;
};

exports.getProductByName = function (name) {
  const product = productTable.find({ name: name }).value();
  return product;
};

exports.getBurgerByName = function (name) {
  const product = productTable.find({ name: name, type: 'Burger' }).value();
  return product;
};

exports.getItemByPayload = function (payload) {
  const product = productTable.find(p => p.payload_name === payload).value();
  return product;
};

exports.getDrinkByName = function (name) {
  const product = productTable.find({ name: name, type: 'Drink' }).value();
  return product;
};

exports.addProduct = function (product) {
  return productTable.upsert(product).value();
};
