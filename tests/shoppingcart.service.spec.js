const shoppingCartSevice = require('../service/shoppingcart.service');
const orderRepository = require('../repository/order.repository');
const productRepository = require('../repository/product.repository');
const util = require('./util/util');
const db = require('../db');

describe.only('Shopping Cart Service', () => {
  const senderId = '2042621042422137';
  const exampleBill = {
    "id": 1,
    "order_id": "59656934",
    "payment_type": "Cash",
    "currency": "VND",
    "subtotal": 85000,
    "shipping_cost": 2000,
    "total_cost": 87000,
    "total_tax": 8700,
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

  beforeEach(done => {
    util.flushDb();
    done();
  });

  afterEach(done => {
    util.flushDb();
    done();
  })

  it('should create an empty order if not exist', () => {
    return shoppingCartSevice
      .forUser(senderId)
      .createOrderIfnotExisted()
      .then(() =>
        orderRepository
          .getUncheckedoutOrder(senderId)
          .should.eventually.to.be.ok
      );
  });

  it('should not create an empty order if not exist', () => {
    return orderRepository
      .insert({
        "order_id": Math.floor(Math.random() * 100000000),
        "payment_type": "Cash",
        "currency": "VND",
        "subtotal": 0,
        "shipping_cost": 0,
        "total_cost": 0,
        "total_tax": 0,
        "checkouted": false,
        "checkoutTime": null,
        "order_user": exampleBill.order_user,
        "order_details": [],
        "shipping_address": null
      })
      .then(expectedOrder =>
        orderRepository.getById(expectedOrder.id)
          .should.eventually.to.be.eql(expectedOrder)
      )
      .then(() =>
        shoppingCartSevice
          .forUser(senderId)
          .createOrderIfnotExisted()
          .then(() =>
            orderRepository
              .findAllWith(o => o.order_user.facebook_id === senderId && !o.checkouted)
              .should.eventually.to.lengthOf(1)
          ));
  });

  it('should return false if there is not an item in shopping cart', () => {
    return shoppingCartSevice
      .forUser(senderId)
      .hasItemInShoppingCart()
      .should.eventually.to.be.false;
  });

  it('should return true if there is an item in shopping cart', () => {
    const burger = productRepository.getBurgerByName('Big Mac');
    const userOrder = shoppingCartSevice.forUser(senderId);
    return userOrder
      .addItem(burger)
      .then(() => userOrder
        .hasItemInShoppingCart()
        .should.eventually.to.be.true
      );
  });

  it('should add a item to the order details', () => {
    const burger = productRepository.getBurgerByName('Big Mac');
    return shoppingCartSevice
      .forUser(senderId)
      .addItem(burger)
      .then(() => orderRepository.getUncheckedoutOrder(senderId))
      .then(order => {
        const order_details = order.order_details;
        const subtotal = burger.unit_price;
        const shippingCost = 0;
        order.subtotal.should.equal(subtotal);
        order.total_cost.should.equal(subtotal + shippingCost);
        order.total_tax.should.equal(subtotal * 0.1);
        order_details.should.lengthOf(1);
        order_details[0].product.should.equal(burger);
        order_details[0].quantity.should.equal(1);
        order_details[0].total_price.should.equal(burger.unit_price);
      });
  });

  it('should add 2 different items to the order details', () => {
    const burger = productRepository.getBurgerByName('Big Mac');
    const coke = productRepository.getDrinkByName('Coca-Cola');
    return shoppingCartSevice
      .forUser(senderId)
      .addItem(burger)
      .then(() => shoppingCartSevice
        .forUser(senderId)
        .addItem(coke))
      .then(() => orderRepository.getUncheckedoutOrder(senderId))
      .then(order => {
        const order_details = order.order_details;
        const subtotal = burger.unit_price + coke.unit_price;
        const shippingCost = 0;
        order.subtotal.should.equal(subtotal);
        order.total_cost.should.equal(subtotal + shippingCost);
        order.total_tax.should.equal(subtotal * 0.1);
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
    const burger = productRepository.getBurgerByName('Big Mac');
    const userOrder = shoppingCartSevice.forUser(senderId);
    return userOrder
      .addItem(burger)
      .then(() => userOrder.addItem(burger))
      .then(() => orderRepository.getUncheckedoutOrder(senderId))
      .then(order => {
        const order_details = order.order_details;
        const subtotal = burger.unit_price * 2;
        const shippingCost = 0;
        order.subtotal.should.equal(subtotal);
        order.total_cost.should.equal(subtotal + shippingCost);
        order.total_tax.should.equal(subtotal * 0.1);
        order_details.should.lengthOf(1);
        order_details[0].product.should.equal(burger);
        order_details[0].quantity.should.equal(2);
        order_details[0].total_price.should.equal(burger.unit_price * 2);
      });
  });

  it('should actively set quantity of an item in the order', () => {
    const burger = productRepository.getBurgerByName('Big Mac');
    const coke = productRepository.getDrinkByName('Coca-Cola');
    const userOrder = shoppingCartSevice.forUser(senderId);
    return userOrder
      .addItem(burger)
      .then(() => userOrder.addItem(coke))
      .then(() => userOrder.setQuantityOfItem(burger, 3))
      .then(() => orderRepository.getUncheckedoutOrder(senderId))
      .then(order => {
        const order_details = order.order_details;
        const subtotal = burger.unit_price * 3 + coke.unit_price;
        const shippingCost = 0;
        const taxRate = 0.1;
        order.subtotal.should.equal(subtotal);
        order.total_cost.should.equal(subtotal + shippingCost);
        order.total_tax.should.equal(subtotal * taxRate);
        order_details.should.lengthOf(2);
        order_details[0].product.should.equal(burger);
        order_details[0].quantity.should.equal(3);
        order_details[0].total_price.should.equal(burger.unit_price * 3);
        order_details[1].product.should.equal(coke);
        order_details[1].quantity.should.equal(1);
        order_details[1].total_price.should.equal(coke.unit_price);
      });
  });

  it('should get the current bill of user', () => {
    const userOrder = shoppingCartSevice.forUser(senderId);
    const burger = productRepository.getBurgerByName('Big Mac');
    return userOrder
      .addItem(burger)
      .then(() => userOrder.getCurrentOrder())
      .then(order =>
        orderRepository
          .getUncheckedoutOrder(senderId)
          .should.eventually.to.eql(order)
      );
  });

  it('should remove an order', () => {
    const userOrder = shoppingCartSevice.forUser(senderId);
    return orderRepository
      .insert({
        "order_id": Math.floor(Math.random() * 100000000),
        "payment_type": "Cash",
        "currency": "VND",
        "subtotal": 0,
        "shipping_cost": 0,
        "total_cost": 0,
        "total_tax": 0,
        "checkouted": false,
        "checkoutTime": null,
        "order_user": exampleBill.order_user,
        "order_details": [],
        "shipping_address": null
      })
      .then(expectedOrder =>
        // to check if order is existed
        orderRepository.getById(expectedOrder.id)
          .should.eventually.to.be.eql(expectedOrder))
      .then(expectedOrder =>
        userOrder
          .removeCurrentOrder()
          .then(() =>
            orderRepository
              .findAllWith(o => o.order_user.facebook_id === senderId && !o.checkouted)
              .should.eventually.to.lengthOf(0)
          ));
  });

  it('should remove an item in order if there is only one', () => {
    const userOrder = shoppingCartSevice.forUser(senderId);
    const burger = productRepository.getBurgerByName('Big Mac');
    return orderRepository
      .insert({
        "order_id": Math.floor(Math.random() * 100000000),
        "payment_type": "Cash",
        "currency": "VND",
        "subtotal": 65000,
        "shipping_cost": 0,
        "total_cost": 65000,
        "total_tax": 6500,
        "checkouted": false,
        "checkoutTime": null,
        "order_user": exampleBill.order_user,
        "order_details": [{
          quantity: 1,
          total_price: 65000,
          product: burger
        }],
        "shipping_address": null
      })
      .then(() => userOrder.removeItem(burger))
      .then(() =>
        orderRepository
          .getUncheckedoutOrder(senderId)
          .then(order => {
            const order_details = order.order_details;
            order.subtotal.should.equal(0);
            order.total_cost.should.equal(0);
            order.total_tax.should.equal(0);
            order_details.should.lengthOf(0);
          }))
  });

  it('should remove an item in order if there are two items', () => {
    const userOrder = shoppingCartSevice.forUser(senderId);
    const burger = productRepository.getBurgerByName('Big Mac');
    const coke = productRepository.getDrinkByName('Coca-Cola');
    return orderRepository
      .insert({
        "order_id": Math.floor(Math.random() * 100000000),
        "payment_type": "Cash",
        "currency": "VND",
        "subtotal": 85000,
        "shipping_cost": 0,
        "total_cost": 85000,
        "total_tax": 8500,
        "checkouted": false,
        "checkoutTime": null,
        "order_user": exampleBill.order_user,
        "order_details": [{
          quantity: 1,
          total_price: 65000,
          product: burger
        }, {
          "quantity": 1,
          "total_price": 20000,
          product: coke
        }],
        "shipping_address": null
      })
      .then(() => userOrder.removeItem(burger))
      .then(() =>
        orderRepository
          .getUncheckedoutOrder(senderId)
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
          }));
  });

  it.only('should decease one quantity of an item in order', () => {
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
          quantity: 3,
          total_price: 65000,
          product: burger
        }, {
          "quantity": 1,
          "total_price": 20000,
          product: coke
        }],
        "shipping_address": null
      })
      .then(() => userOrder.deceaseQuantityOfItem(burger, 2))
      .then(() =>
        orderRepository
          .getUncheckedoutOrder(senderId)
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
          }));
  });

  it('should add a payment type', () => {
    const userOrder = shoppingCartSevice.forUser(senderId);
    const newPaymentType = 'Credit Card';
    return userOrder
      .changePaymentType(newPaymentType)
      .then(() => orderRepository.getUncheckedoutOrder(senderId))
      .then(order => order.payment_type)
      .should.eventually.to.equal(newPaymentType);
  });

  it.skip('should add a shipping address', () => {
  });

  it.skip('should get the recript', () => {
  });
});
