const productRepository = require('../repository/product.repository');
const userRepository = require('../repository/user.repository');
const orderRepository = require('../repository/order.repository');
const _ = require('lodash');

const defaultConstraint = {
  paymentType: 'Cash',
  taxRate: 0.1, // 10% VAT tax
  shoppingCost: 0,
  currency: "VND",
}

function addPaymentType(senderId, paymentType) { };

function checkout(senderId) {
  return {
    id: 1,
    order_id: '59656934',
    payment_type: 'Cash',
    currency: 'VND',
    subtotal: 85000,
    shipping_cost: 2000,
    total_cost: 87000,
    total_tax: 8700,
    checkouted: true,
    timestamp: '1428444852',
    order_user: {
      id: 1,
      facebook_id: '2042621042422137',
      first_name: 'Quang',
      last_name: 'Tran',
      gender: 'male',
      timezone: 7,
    },
    order_details: [
      {
        quantity: 1,
        total_price: 65000,
        product: {
          name: 'Big Mac',
          type: 'Burger',
          item_url: 'https://www.mcdonalds.com/us/en-us/product/big-mac.html',
          image_url:
          'https://www.mcdonalds.com/content/dam/usa/promotions/mobile/extravaluemeal-mobile.jpg',
          unit_price: 65000,
          currency: 'VND',
          description: 'The one and only.',
          payload_name: 'BIG_MAC',
          id: 1,
        },
      },
      {
        quantity: 1,
        total_price: 20000,
        product: {
          name: 'McCafé Coffee',
          type: 'Drink',
          item_url:
          'https://www.mcdonalds.com/us/en-us/product/coffee-small.html',
          image_url:
          'http://cdn0.wideopeneats.com/wp-content/uploads/2016/12/mccafe.jpg',
          unit_price: 20000,
          currency: 'VND',
          description: 'Invigorate your morning.',
          payload_name: 'MCCAFE_COFFEE',
          id: 5,
        },
      },
    ],
    shipping_address: {
      customer_name: 'Quang Tran',
      city: 'Ho Chi Minh',
      postal_code: '700000',
      state: 'HCM',
      street: '702 Nguyen Van Linh',
      country: 'VN',
    },
  };
};


function createOrderIfnotExisted(senderId) {
  return userRepository
    .getUserByFacebookId(senderId)
    .then(user => orderRepository
      .getUncheckedoutOrder(senderId)
      .then(order => {
        return order ? order : orderRepository.insert({
          "order_id": Math.floor(Math.random() * 100000000).toString(),
          "payment_type": defaultConstraint.paymentType,
          "currency": defaultConstraint.currency,
          "subtotal": 0,
          "shipping_cost": 0,
          "total_cost": 0,
          "total_tax": 0,
          "checkouted": false,
          "checkoutTime": null,
          "order_user": user,
          "order_details": [],
          "shipping_address": null
        })
      }));
}

function hasItemInShoppingCart(senderId) {
  return createOrderIfnotExisted(senderId)
    .then(() => orderRepository.getUncheckedoutOrder(senderId))
    .then(order => order.order_details.length > 0);
}

function addItem(senderId, item) {
  return createOrderIfnotExisted(senderId)
    .then(() => orderRepository.getUncheckedoutOrder(senderId))
    .then(order => {
      if (order.order_details.length === 0 ||
        !order.order_details.find(od => od.product.id === item.id)) {
        const order_detail = {
          quantity: 1,
          total_price: item.unit_price,
          product: item,
        };
        order.subtotal += order_detail.total_price;
        order.total_cost += order_detail.total_price;
        order.total_tax = order.total_cost * defaultConstraint.taxRate;
        order.order_details.push.call(order.order_details, order_detail);
      } else {
        let order_detail = _.find(order.order_details, od => od.product.id === item.id);
        order_detail.quantity = order_detail.quantity + 1;
        order_detail.total_price = order_detail.product.unit_price * order_detail.quantity;
        const item_index = _.findIndex(order.order_details, od => od.product.id === item.id);
        order.order_details[item_index] = order_detail;
        order.subtotal += order_detail.product.unit_price;
        order.total_cost += order_detail.product.unit_price;
        order.total_tax = order.total_cost * defaultConstraint.taxRate;
      }
      return orderRepository.update(order);
    });
}

function getCurrentOrder(senderId) {
  return orderRepository.getUncheckedoutOrder(senderId);
}

const shoppingCartService = {
  addItem,
  addPaymentType,
  checkout,
  createOrderIfnotExisted,
  forUser,
  hasItemInShoppingCart,
  getCurrentOrder,
};

/**
 * Reduce the senderId arguments in every function
 * @param {String} senderId - facebook user Id 
 * @return {Object} Reduced senderId arguement of shoppingCartService object
 */
function forUser(senderId) {
  return _.mapValues(shoppingCartService, f => f.bind(null, senderId));
}

module.exports = shoppingCartService;