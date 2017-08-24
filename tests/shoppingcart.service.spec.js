const shoppingCartSevice = require('../service/shoppingcart.service');
const orderRepository = require('../repository/order.repository');
const productRepository = require('../repository/product.repository');
const userRepository = require('../repository/user.repository');
const sinon = require('sinon');
const util = require('./util/util');
const db = require('../db');

describe.only('ShoppingCartService', () => {
  const senderId = '2042621042422137';
  const exampleBill = {
    "id": 1,
    "order_id": "59656934",
    "payment_type": "Cash",
    "currency": "VND",
    "subtotal": 85000,
    "shipping_cost": 0,
    "total_cost": 85000,
    "total_tax": 8500,
    "checkouted": true,
    "checkoutTime": "1503154662671",
    "updatedTime": "1503154662671",
    "createdTime": "1503154662671",
    "order_user": {
      "id": 1,
      "facebook_id": "2042621042422137",
      "first_name": "Quang",
      "last_name": "Tran",
      "gender": "male",
      "timezone": 7
    },
    "order_details": [
      {
        "quantity": 1,
        "total_price": 65000,
        "product": {
          "name": "Big Mac",
          "type": "Burger",
          "item_url": "https://www.mcdonalds.com/us/en-us/product/big-mac.html",
          "image_url": "https://www.mcdonalds.com/content/dam/usa/promotions/mobile/extravaluemeal-mobile.jpg",
          "unit_price": 65000,
          "currency": "VND",
          "description": "The one and only.",
          "payload_name": "BIG_MAC",
          "id": 1
        }
      },
      {
        "quantity": 1,
        "total_price": 20000,
        "product": {
          "name": "McCafé Coffee",
          "type": "Drink",
          "item_url": "https://www.mcdonalds.com/us/en-us/product/coffee-small.html",
          "image_url": "http://cdn0.wideopeneats.com/wp-content/uploads/2016/12/mccafe.jpg",
          "unit_price": 20000,
          "currency": "VND",
          "description": "Invigorate your morning.",
          "payload_name": "MCCAFE_COFFEE",
          "id": 6
        }
      }
    ],
    "shipping_address": {
      "customer_name": "Quang Tran",
      "city": "Ho Chi Minh",
      "postal_code": "700000",
      "state": "HCM",
      "street": "702 Nguyen Van Linh",
      "country": "VN"
    }
  };
  const userCart = shoppingCartSevice.forUser(senderId);

  beforeEach(done => {
    util.flushDb();
    done();
  });

  afterEach(done => {
    util.flushDb();
    done();
  })

  describe('createOrderIfnotExisted', () => {
    let getUserByFacebookId;
    let orderInsert;
    let getUncheckedoutOrder;

    beforeEach(() => {
      getUserByFacebookId = sinon.stub(userRepository, 'getUserByFacebookId')
        .callsFake(senderId => Promise.resolve(exampleBill.order_user));
      getUncheckedoutOrder = sinon.stub(orderRepository, 'getUncheckedoutOrder')
        .callsFake(() => Promise.resolve(null));;
      orderInsert = sinon.stub(orderRepository, 'insert');
    });

    afterEach(() => {
      getUserByFacebookId.restore();
      getUncheckedoutOrder.restore();
      orderInsert.restore();
    })

    it('should create an empty order if not exist', () => {
      getUncheckedoutOrder.callsFake(() => Promise.resolve(null));

      return userCart.createOrderIfnotExisted()
        .then(() => {
          getUserByFacebookId.should.have.been.calledOnce;
          getUncheckedoutOrder.should.have.been.calledOnce;
          orderInsert.should.have.been.calledOnce;
        });
    });

    it('should not create an empty order if not exist', () => {
      getUncheckedoutOrder.callsFake(senderId => Promise.resolve(exampleBill));

      return userCart.createOrderIfnotExisted()
        .then(() => {
          getUserByFacebookId.should.have.been.calledOnce;
          getUncheckedoutOrder.should.have.been.calledOnce;
          orderInsert.should.not.have.been.calledOnce;
        });
    });
  });

  describe('hasItemInShoppingCart', () => {
    let createOrderIfnotExisted;
    let getUncheckedoutOrder;

    beforeEach(() => {
      getUncheckedoutOrder = sinon.stub(orderRepository, 'getUncheckedoutOrder');
      createOrderIfnotExisted = sinon.stub(shoppingCartSevice, 'createOrderIfnotExisted')
        .callsFake(() => Promise.resolve(null));
    });

    afterEach(() => {
      createOrderIfnotExisted.restore();
      getUncheckedoutOrder.restore();
    })

    it('should return false if there is not an item in shopping cart', () => {
      getUncheckedoutOrder
        .callsFake(senderId =>
          Promise.resolve(Object.assign({}, exampleBill, { order_details: [] })));
      return userCart.hasItemInShoppingCart()
        .should.eventually.to.be.false;
    });

    it('should return true if there is an item in shopping cart', () => {
      getUncheckedoutOrder
        .callsFake(senderId =>
          Promise.resolve(Object.assign({}, exampleBill)));
      return userCart.hasItemInShoppingCart()
        .should.eventually.to.be.true;
    });
  });

  describe('addItem', () => {
    const burger = exampleBill.order_details[0].product;
    const coke = exampleBill.order_details[1].product;
    let createOrderIfnotExisted;
    let getUncheckedoutOrder;
    let orderUpdate;
    let ordering;
    beforeEach(() => {
      createOrderIfnotExisted = sinon.stub(shoppingCartSevice, 'createOrderIfnotExisted')
        .callsFake(() => Promise.resolve(null));
      getUncheckedoutOrder = sinon.stub(orderRepository, 'getUncheckedoutOrder')
        .callsFake(senderId => Promise.resolve(ordering));
      orderUpdate = sinon.stub(orderRepository, 'update')
        .callsFake(order => ordering = Object.assign({}, order));
      ordering = Object.assign({}, exampleBill, {
        subtotal: 0,
        total_cost: 0,
        total_tax: 0,
        order_details: []
      })
    });
    afterEach(() => {
      getUncheckedoutOrder.restore();
      createOrderIfnotExisted.restore();
      orderUpdate.restore();
    });

    it('should add a item to the order details', () => {
      return userCart.addItem(burger)
        .then(order => {
          const order_details = ordering.order_details;
          const subtotal = burger.unit_price;
          const shippingCost = 0;
          ordering.subtotal.should.equal(subtotal);
          ordering.total_cost.should.equal(subtotal + shippingCost);
          ordering.total_tax.should.equal(subtotal * 0.1);
          order_details.should.lengthOf(1);
          order_details[0].product.should.equal(burger);
          order_details[0].quantity.should.equal(1);
          order_details[0].total_price.should.equal(burger.unit_price);
        });
    });

    it('should add 2 different items to the order details', () => {
      return Promise.all([
        userCart.addItem(burger),
        userCart.addItem(coke),
      ])
        .then(() => {
          const order_details = ordering.order_details;
          const subtotal = burger.unit_price + coke.unit_price;
          const shippingCost = 0;
          ordering.subtotal.should.equal(subtotal);
          ordering.total_cost.should.equal(subtotal + shippingCost);
          ordering.total_tax.should.equal(subtotal * 0.1);
          order_details.should.lengthOf(2);
          order_details[0].product.should.equal(burger);
          order_details[0].quantity.should.equal(1);
          order_details[0].total_price.should.equal(burger.unit_price);
          order_details[1].product.should.equal(coke);
          order_details[1].quantity.should.equal(1);
          order_details[1].total_price.should.equal(coke.unit_price);
        });
    });

    it('should increase the quantity if the item is in the list', () => {
      return Promise.all([
        userCart.addItem(burger),
        userCart.addItem(burger),
      ])
        .then(() => {
          const order_details = ordering.order_details;
          const subtotal = burger.unit_price * 2;
          const shippingCost = 0;
          ordering.subtotal.should.equal(subtotal);
          ordering.total_cost.should.equal(subtotal + shippingCost);
          ordering.total_tax.should.equal(subtotal * 0.1);
          order_details.should.lengthOf(1);
          order_details[0].product.should.equal(burger);
          order_details[0].quantity.should.equal(2);
          order_details[0].total_price.should.equal(burger.unit_price * 2);
        });
    });
  })

  describe('setQuantityOfItem', () => {
    const burger = exampleBill.order_details[0].product;
    const coke = exampleBill.order_details[1].product;
    let createOrderIfnotExisted;
    let getUncheckedoutOrder;
    let orderUpdate;
    let ordering;

    beforeEach(() => {
      createOrderIfnotExisted = sinon.stub(shoppingCartSevice, 'createOrderIfnotExisted')
        .callsFake(() => Promise.resolve(null));
      getUncheckedoutOrder = sinon.stub(orderRepository, 'getUncheckedoutOrder')
        .callsFake(senderId => Promise.resolve(ordering));
      orderUpdate = sinon.stub(orderRepository, 'update')
        .callsFake(order => ordering = Object.assign({}, order));
      ordering = Object.assign({}, exampleBill);
    });

    afterEach(() => {
      getUncheckedoutOrder.restore();
      createOrderIfnotExisted.restore();
      orderUpdate.restore();
    });

    it('should actively set quantity of an item in the order', () => {
      return userCart.setQuantityOfItem(burger, 3)
        .then(() => {
          const order_details = ordering.order_details;
          const subtotal = burger.unit_price * 3 + coke.unit_price;
          const shippingCost = 0;
          const taxRate = 0.1;
          ordering.subtotal.should.equal(subtotal);
          ordering.total_cost.should.equal(subtotal + shippingCost);
          ordering.total_tax.should.equal(subtotal * taxRate);
          order_details.should.lengthOf(2);
          order_details[0].product.should.equal(burger);
          order_details[0].quantity.should.equal(3);
          order_details[0].total_price.should.equal(burger.unit_price * 3);
          order_details[1].product.should.equal(coke);
          order_details[1].quantity.should.equal(1);
          order_details[1].total_price.should.equal(coke.unit_price);
        });
    });

    it('should set to 0 if quantity parameter is smaller than 0', () => {
      return userCart.setQuantityOfItem(burger, -1)
        .then(() => {
          const order_details = ordering.order_details;
          const subtotal = burger.unit_price * 0 + coke.unit_price;
          const shippingCost = 0;
          const taxRate = 0.1;
          ordering.subtotal.should.equal(subtotal);
          ordering.total_cost.should.equal(subtotal + shippingCost);
          ordering.total_tax.should.equal(subtotal * taxRate);
          order_details.should.lengthOf(2);
          order_details[0].product.should.equal(burger);
          order_details[0].quantity.should.equal(0);
          order_details[0].total_price.should.equal(burger.unit_price * 0);
          order_details[1].product.should.equal(coke);
          order_details[1].quantity.should.equal(1);
          order_details[1].total_price.should.equal(coke.unit_price);
        });
    });
  });

  describe('getCurrentOrder', () => {
    it('should get the current bill of user', () => {
      const getUncheckedoutOrder = sinon.stub(orderRepository, 'getUncheckedoutOrder')
        .callsFake(() => Promise.resolve(null));
      return userCart.getCurrentOrder()
        .then(() => {
          getUncheckedoutOrder.restore();
          getUncheckedoutOrder.should.have.been.calledOnce;
        });
    });
  })


  describe('removeCurrentOrder', () => {

    it('should remove an order', () => {
      const getCurrentOrder = sinon.stub(userCart, 'getCurrentOrder')
        .callsFake(() => Promise.resolve(null));
      const remove = sinon.stub(orderRepository, 'remove').callsFake(() => { });
      return userCart.removeCurrentOrder()
        .then(() => {
          getCurrentOrder.restore();
          remove.restore();
          remove.should.have.been.calledOnce;
        });
    });
  })

  describe('removeItem', () => {
    const burger = exampleBill.order_details[0].product;
    const coke = exampleBill.order_details[1].product;
    let getUncheckedoutOrder;
    let update;
    beforeEach(() => {
      getUncheckedoutOrder = sinon.stub(orderRepository, 'getUncheckedoutOrder');
      update = sinon.stub(orderRepository, 'update')
        .callsFake(order => ordering = Object.assign({}, order));
    });

    afterEach(() => {
      getUncheckedoutOrder.restore();
      update.restore();
    })

    it('should remove an item in order if there is only one', () => {
      getUncheckedoutOrder.callsFake(() =>
        Promise.resolve(Object.assign({}, exampleBill, {
          subtotal: 65000,
          total_cost: 65000,
          total_tax: 6500,
          order_details: [{
            quantity: 1,
            total_price: 65000,
            product: burger
          }],
        })));
      return userCart.removeItem(burger)
        .then(order => {
          getUncheckedoutOrder.restore();
          update.restore();
          const order_details = order.order_details;
          order.subtotal.should.equal(0);
          order.total_cost.should.equal(0);
          order.total_tax.should.equal(0);
          order_details.should.lengthOf(0);
        });
    });

    it('should remove an item in order if there are two items', () => {
      getUncheckedoutOrder.callsFake(() =>
        Promise.resolve(Object.assign({}, exampleBill, {
          "subtotal": 85000,
          "total_cost": 85000,
          "total_tax": 8500,
          "order_details": [{
            quantity: 1,
            total_price: 65000,
            product: burger
          }, {
            "quantity": 1,
            "total_price": 20000,
            product: coke
          }],
        })));
      return userCart.removeItem(burger)
        .then(order => {
          const order_details = order.order_details;
          const subtotal = coke.unit_price;
          const shippingCost = 0;
          const taxRate = 0.1;
          order.subtotal.should.equal(subtotal);
          order.total_cost.should.equal(subtotal + shippingCost);
          order.total_tax.should.equal((subtotal + shippingCost) * taxRate);
          order_details.should.lengthOf(1);
          order_details[0].product.should.equal(coke);
          order_details[0].quantity.should.equal(1);
          order_details[0].total_price.should.equal(coke.unit_price);
        });
    });
  })

  describe('deceaseQuantityOfItem', () => {
    const burger = exampleBill.order_details[0].product;
    const coke = exampleBill.order_details[1].product;
    let getUncheckedoutOrder;
    let update;
    beforeEach(() => {
      getUncheckedoutOrder = sinon.stub(orderRepository, 'getUncheckedoutOrder');
      update = sinon.stub(orderRepository, 'update')
        .callsFake(order => ordering = Object.assign({}, order));
    });

    afterEach(() => {
      getUncheckedoutOrder.restore();
      update.restore();
    })

    it('should decease one quantity of an item in order', () => {
      getUncheckedoutOrder.callsFake(() =>
        Promise.resolve(Object.assign({}, exampleBill, {
          "subtotal": 215000,
          "total_cost": 215000,
          "total_tax": 21500,
          "order_details": [{
            quantity: 3,
            total_price: 65000,
            product: burger
          }, {
            "quantity": 1,
            "total_price": 20000,
            product: coke
          }],
        })));
      return userCart.deceaseQuantityOfItem(burger)
        .then(order => {
          const order_details = order.order_details;
          const subtotal = burger.unit_price * 2 + coke.unit_price;
          const shippingCost = 0;
          const taxRate = 0.1;
          order.subtotal.should.equal(subtotal);
          order.total_cost.should.equal(subtotal + shippingCost);
          order.total_tax.should.equal((subtotal + shippingCost) * taxRate);
          order_details.should.lengthOf(2);
          order_details[0].product.should.equal(burger);
          order_details[0].quantity.should.equal(2);
          order_details[0].total_price.should.equal(burger.unit_price * 2);
          order_details[1].product.should.equal(coke);
          order_details[1].quantity.should.equal(1);
          order_details[1].total_price.should.equal(coke.unit_price);
        });
    });

    it('should decease two quantity of an item in order', () => {
      getUncheckedoutOrder.callsFake(() =>
        Promise.resolve(Object.assign({}, exampleBill, {
          "subtotal": 215000,
          "total_cost": 215000,
          "total_tax": 21500,
          "order_details": [{
            quantity: 3,
            total_price: 65000,
            product: burger
          }, {
            "quantity": 1,
            "total_price": 20000,
            product: coke
          }],
        })));
      return userCart.deceaseQuantityOfItem(burger, 2)
        .then(order => {
          const order_details = order.order_details;
          const subtotal = burger.unit_price + coke.unit_price;
          const shippingCost = 0;
          const taxRate = 0.1;
          order.subtotal.should.equal(subtotal);
          order.total_cost.should.equal(subtotal + shippingCost);
          order.total_tax.should.equal((subtotal + shippingCost) * taxRate);
          order_details.should.lengthOf(2);
          order_details[0].product.should.equal(burger);
          order_details[0].quantity.should.equal(1);
          order_details[0].total_price.should.equal(burger.unit_price);
          order_details[1].product.should.equal(coke);
          order_details[1].quantity.should.equal(1);
          order_details[1].total_price.should.equal(coke.unit_price);
        });
    });

    it('should decease none if input quantity is less than 0', () => {
      getUncheckedoutOrder.callsFake(() =>
        Promise.resolve(Object.assign({}, exampleBill, {
          "subtotal": 215000,
          "total_cost": 215000,
          "total_tax": 21500,
          "order_details": [{
            quantity: 3,
            total_price: 65000,
            product: burger
          }, {
            "quantity": 1,
            "total_price": 20000,
            product: coke
          }],
        })));
      return userCart.deceaseQuantityOfItem(burger, 0)
        .then(order => {
          const order_details = order.order_details;
          const subtotal = burger.unit_price * 3 + coke.unit_price;
          const shippingCost = 0;
          const taxRate = 0.1;
          order.subtotal.should.equal(subtotal);
          order.total_cost.should.equal(subtotal + shippingCost);
          order.total_tax.should.equal((subtotal + shippingCost) * taxRate);
          order_details.should.lengthOf(2);
          order_details[0].product.should.equal(burger);
          order_details[0].quantity.should.equal(3);
          order_details[0].total_price.should.equal(burger.unit_price * 3);
          order_details[1].product.should.equal(coke);
          order_details[1].quantity.should.equal(1);
          order_details[1].total_price.should.equal(coke.unit_price);
        });
    });
  })



  describe('changePaymentType', () => {
    it('should add a payment type', () => {
      const newPaymentType = 'Credit Card';
      return userCart.changePaymentType(newPaymentType)
        .then(() => orderRepository.getUncheckedoutOrder(senderId))
        .then(order => order.payment_type)
        .should.eventually.to.equal(newPaymentType);
    });
  })

  describe('Shipping Address', () => {

    it('should add a shipping address to bill', () => {
      const userOrder = shoppingCartSevice.forUser(senderId);
      const burger = productRepository.getBurgerByName('Big Mac');
      const coke = productRepository.getDrinkByName('Coca-Cola');
      return orderRepository
        .insert({
          "order_id": Math.floor(Math.random() * 100000000),
          "payment_type": "Cash",
          "currency": "VND",
          "subtotal": 215000,
          "shipping_cost": 0,
          "total_cost": 215000,
          "total_tax": 21500,
          "checkouted": false,
          "checkoutTime": null,
          "order_user": exampleBill.order_user,
          "order_details": [{
            "quantity": 3,
            "total_price": 65000,
            "product": burger
          }, {
            "quantity": 1,
            "total_price": 20000,
            "product": coke
          }],
          "shipping_address": null
        })
        .then(() => userOrder.setShippingAddress(exampleBill.shipping_address))
        .then(() =>
          orderRepository
            .getUncheckedoutOrder(senderId)
            .then(order => {
              order.shipping_address.should.equal(exampleBill.shipping_address);
            }))
    });

    it('should get a shipping address from bill', () => {
      const userOrder = shoppingCartSevice.forUser(senderId);
      const burger = productRepository.getBurgerByName('Big Mac');
      const coke = productRepository.getDrinkByName('Coca-Cola');
      return orderRepository
        .insert({
          "order_id": Math.floor(Math.random() * 100000000),
          "payment_type": "Cash",
          "currency": "VND",
          "subtotal": 215000,
          "shipping_cost": 0,
          "total_cost": 215000,
          "total_tax": 21500,
          "checkouted": false,
          "checkoutTime": null,
          "order_user": exampleBill.order_user,
          "order_details": [{
            "quantity": 3,
            "total_price": 65000,
            "product": burger
          }, {
            "quantity": 1,
            "total_price": 20000,
            "product": coke
          }],
          "shipping_address": exampleBill.shipping_address
        })
        .then(() => userOrder.getShippingAddress())
        .then(shipping_address => shipping_address.should.equal(exampleBill.shipping_address));
    });

    it('should add a shipping address to bill', () => {
      const userOrder = shoppingCartSevice.forUser(senderId);
      const burger = productRepository.getBurgerByName('Big Mac');
      const coke = productRepository.getDrinkByName('Coca-Cola');
      return orderRepository
        .insert({
          "order_id": Math.floor(Math.random() * 100000000),
          "payment_type": "Cash",
          "currency": "VND",
          "subtotal": 215000,
          "shipping_cost": 0,
          "total_cost": 215000,
          "total_tax": 21500,
          "checkouted": false,
          "checkoutTime": null,
          "order_user": exampleBill.order_user,
          "order_details": [{
            "quantity": 3,
            "total_price": 65000,
            "product": burger
          }, {
            "quantity": 1,
            "total_price": 20000,
            "product": coke
          }],
          "shipping_address": null
        })
        .then(() => userOrder.setShippingAddress(exampleBill.shipping_address))
        .then(() =>
          orderRepository
            .getUncheckedoutOrder(senderId)
            .then(order => {
              order.shipping_address.should.equal(exampleBill.shipping_address);
            }))
    });

  });

  describe('checkout', () => {
    it('should get the recript', () => {
      const orderUpdate = sinon.stub(orderRepository, 'update')
        .callsFake(order => order);
      const getUncheckedoutOrder = sinon.stub(orderRepository, 'getUncheckedoutOrder')
        .callsFake(() => Promise.resolve(Object.assign({}, exampleBill, { checkout: false, checkoutTime: null })))
      return userCart.checkout()
        .then(order => {
          orderUpdate.restore();
          getUncheckedoutOrder.restore();
          order.checkoutTime.should.to.be.a('string');
          order.checkouted.should.to.be.true;
          orderUpdate.should.have.been.calledOnce;
        });
    });
  })

});
