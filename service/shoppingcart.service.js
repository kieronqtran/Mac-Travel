const productRepository = require('../repository/product.repository');
const userRepository = require('../repository/user.repository');
const orderRepository = require('../repository/order.repository');
const _ = require('lodash');

const defaultConstraint = {
  paymentType: 'Cash',
  taxRate: 0.1, // 10% VAT tax
  shoppingCost: 0,
  currency: 'VND',
};

function changePaymentType(senderId, paymentType) {
  return createOrderIfnotExisted(senderId)
    .then(() => orderRepository.getUncheckedoutOrder(senderId))
    .then(order => {
      order.payment_type = paymentType;
      return order;
    })
    .then(order => orderRepository.update(order));
}

function checkout(senderId) {
  return orderRepository.getUncheckedoutOrder(senderId).then(order => {
    order.checkouted = true;
    order.checkoutTime = Math.floor(Date.now() / 1000).toString();
    return orderRepository.update(order);
  });
}

function createOrderIfnotExisted(senderId) {
  return userRepository.getUserByFacebookId(senderId).then(user =>
    orderRepository.getUncheckedoutOrder(senderId).then(order => {
      return order
        ? order
        : orderRepository.insert({
            order_id: Math.floor(Math.random() * 100000000).toString(),
            payment_type: defaultConstraint.paymentType,
            currency: defaultConstraint.currency,
            subtotal: 0,
            shipping_cost: 0,
            total_cost: 0,
            total_tax: 0,
            checkouted: false,
            checkoutTime: null,
            order_user: user,
            order_details: [],
            shipping_address: null,
          });
    })
  );
}

function hasItemInShoppingCart(senderId) {
  return createOrderIfnotExisted(senderId)
    .then(() => orderRepository.getUncheckedoutOrder(senderId))
    .then(order => order.order_details.length > 0);
}

//TODO: implement quantity
function addItem(senderId, item) {
  return createOrderIfnotExisted(senderId)
    .then(() => orderRepository.getUncheckedoutOrder(senderId))
    .then(order => {
      if (
        order.order_details.length === 0 ||
        !order.order_details.find(od => od.product.id === item.id)
      ) {
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
        const order_detail = _.find(
          order.order_details,
          od => od.product.id === item.id
        );
        order_detail.quantity = order_detail.quantity + 1;
        order_detail.total_price =
          order_detail.product.unit_price * order_detail.quantity;
        const item_index = _.findIndex(
          order.order_details,
          od => od.product.id === item.id
        );
        order.order_details[item_index] = order_detail;
        order.subtotal += order_detail.product.unit_price;
        order.total_cost += order_detail.product.unit_price;
        order.total_tax = order.total_cost * defaultConstraint.taxRate;
      }
      return orderRepository.update(order);
    });
}

function getCurrentOrder(senderId) {
  return orderRepository
    .getUncheckedoutOrder(senderId)
    .then(order => (order ? order : createOrderIfnotExisted(senderId)));
}

function setQuantityOfItem(senderId, item, quantity) {
  return orderRepository
    .getUncheckedoutOrder(senderId)
    .then(order => {
      if (
        order.order_details.length === 0 ||
        !order.order_details.find(od => od.product.id === item.id)
      ) {
        return addItem(item);
      }
      return order;
    })
    .then(order => {
      if (quantity > -1) {
        const order_detail = _.find(
          order.order_details,
          od => od.product.id === item.id
        );
        order_detail.quantity = quantity;
        order_detail.total_price =
          order_detail.product.unit_price * order_detail.quantity;
        const item_index = _.findIndex(
          order.order_details,
          od => od.product.id === item.id
        );
        order.order_details[item_index] = order_detail;
        order.subtotal = order.order_details.reduce(
          (previous, current) => previous + current.total_price,
          0
        );
        order.total_cost = order.subtotal + order.shipping_cost;
        order.total_tax = order.total_cost * defaultConstraint.taxRate;
        return orderRepository.update(order);
      }
      //TODO: Need refactor to smaller code size
      const order_detail = _.find(
        order.order_details,
        od => od.product.id === item.id
      );
      order_detail.quantity = 0;
      order_detail.total_price =
        order_detail.product.unit_price * order_detail.quantity;
      const item_index = _.findIndex(
        order.order_details,
        od => od.product.id === item.id
      );
      order.order_details[item_index] = order_detail;
      order.subtotal = order.order_details.reduce(
        (previous, current) => previous + current.total_price,
        0
      );
      order.total_cost = order.subtotal + order.shipping_cost;
      order.total_tax = order.total_cost * defaultConstraint.taxRate;
      return orderRepository.update(order);
    });
}

function removeCurrentOrder(senderId) {
  return orderRepository
    .getUncheckedoutOrder(senderId)
    .then(order => orderRepository.remove(order));
}

function removeItem(senderId, item) {
  return orderRepository.getUncheckedoutOrder(senderId).then(order => {
    const order_details = order.order_details;
    if (order_details.length > 0) {
      _.remove(order.order_details, o => o.product.id === item.id);
      if (order.order_details.length === 0) {
        order.subtotal = 0;
        order.total_cost = 0;
        order.total_tax = 0;
      } else {
        order.subtotal = order.order_details.reduce(
          (previous, current) => previous + current.total_price,
          0
        );
        order.total_cost = order.subtotal + order.shipping_cost;
        order.total_tax = order.total_cost * defaultConstraint.taxRate;
      }
    }
    return orderRepository.update(order);
  });
}

function deceaseQuantityOfItem(senderId, item, quantity) {
  return orderRepository.getUncheckedoutOrder(senderId).then(order => {
    const itemOfOrderDetail = _.find(
      order.order_details,
      od => od.product.id === item.id
    );
    if (order.order_details.length !== 0 || !itemOfOrderDetail) {
      let defaultQuantity = 0;
      if (typeof quantity === 'undefined') {
        defaultQuantity = itemOfOrderDetail.quantity - 1;
      } else {
        if (quantity < 1) {
          defaultQuantity = itemOfOrderDetail.quantity;
        } else {
          defaultQuantity = itemOfOrderDetail.quantity - quantity;
        }
      }
      return setQuantityOfItem(senderId, item, defaultQuantity);
    }
    return orderRepository.update(order);
  });
}

function getShippingAddress(senderId) {
  return getCurrentOrder(senderId).then(order => order.shipping_address);
}

function setShippingAddress(senderId, shipping_address) {
  return getCurrentOrder(senderId).then(order => {
    order.shipping_address = shipping_address;
    return orderRepository.update(order);
  });
}

const shoppingCartService = {
  addItem,
  changePaymentType,
  checkout,
  createOrderIfnotExisted,
  deceaseQuantityOfItem,
  forUser,
  hasItemInShoppingCart,
  removeCurrentOrder,
  removeItem,
  getCurrentOrder,
  setQuantityOfItem,
  setShippingAddress,
  getShippingAddress,
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
