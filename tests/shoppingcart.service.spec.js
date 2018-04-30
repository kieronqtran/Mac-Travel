const shoppingCartSevice = require('../service/shoppingcart.service');
const orderRepository = require('../repository/order.repository');
const productRepository = require('../repository/product.repository');
const userRepository = require('../repository/user.repository');
const util = require('./util/util');
const db = require('../db');

describe.skip('ShoppingCartService', () => {
  const senderId = '2042621042422137';
  const exampleBill = {
    id: 1,
    order_id: '59656934',
    payment_type: 'Cash',
    currency: 'VND',
    subtotal: 85000,
    shipping_cost: 0,
    total_cost: 85000,
    total_tax: 8500,
    checkouted: true,
    checkoutTime: '1503154662671',
    updatedTime: '1503154662671',
    createdTime: '1503154662671',
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
          id: 6,
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
  const userCart = shoppingCartSevice.forUser(senderId);

  beforeEach(done => {
    util.flushDb();
    done();
  });

  afterEach(done => {
    util.flushDb();
    done();
  });

  describe('createOrderIfnotExisted', () => {
    beforeEach(() => {
      userRepository.getUserByFacebookId = jest
        .fn()
        .mockResolvedValue(exampleBill.order_user);
      orderRepository.getUncheckedoutOrder = jest.fn().mockResolvedValue(null);
      orderRepository.insert = jest.fn().mockResolvedValue(null);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should create an empty order if not exist', async () => {
      await userCart.createOrderIfnotExisted();

      expect(userRepository.getUserByFacebookId).toBeCalledWith(senderId);
      expect(orderRepository.getUncheckedoutOrder).toBeCalledWith(senderId);
      expect(orderRepository.insert).toBeCalled();
    });

    test('should not create an empty order if not exist', async () => {
      orderRepository.getUncheckedoutOrder.mockResolvedValue(exampleBill);

      await userCart.createOrderIfnotExisted();

      expect(userRepository.getUserByFacebookId).toBeCalledWith(senderId);
      expect(orderRepository.getUncheckedoutOrder).toBeCalledWith(senderId);
      expect(orderRepository.insert).not.toBeCalled();
    });
  });

  describe('hasItemInShoppingCart', () => {
    let createOrderIfnotExisted;
    let getUncheckedoutOrder;

    beforeEach(() => {
      getUncheckedoutOrder = jest.spyOn(
        orderRepository,
        'getUncheckedoutOrder'
      );
      createOrderIfnotExisted = jest
        .spyOn(shoppingCartSevice, 'createOrderIfnotExisted')
        .mockImplementation(() => Promise.resolve(null));
    });

    afterEach(() => {
      createOrderIfnotExisted.restore();
      getUncheckedoutOrder.restore();
    });

    test('should return false if there is not an item in shopping cart', async () => {
      getUncheckedoutOrder.mockImplementation(senderId =>
        Promise.resolve(Object.assign({}, exampleBill, {order_details: []}))
      );
      return expect(await userCart.hasItemInShoppingCart()).toBe(false);
    });

    test('should return true if there is an item in shopping cart', async () => {
      getUncheckedoutOrder.mockImplementation(senderId =>
        Promise.resolve(Object.assign({}, exampleBill))
      );
      return expect(await userCart.hasItemInShoppingCart()).toBe(true);
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
      createOrderIfnotExisted = jest
        .spyOn(shoppingCartSevice, 'createOrderIfnotExisted')
        .mockImplementation(() => Promise.resolve(null));
      getUncheckedoutOrder = jest
        .spyOn(orderRepository, 'getUncheckedoutOrder')
        .mockImplementation(senderId => Promise.resolve(ordering));
      orderUpdate = jest
        .spyOn(orderRepository, 'update')
        .mockImplementation(order => (ordering = Object.assign({}, order)));
      ordering = Object.assign({}, exampleBill, {
        subtotal: 0,
        total_cost: 0,
        total_tax: 0,
        order_details: [],
      });
    });
    afterEach(() => {
      getUncheckedoutOrder.restore();
      createOrderIfnotExisted.restore();
      orderUpdate.restore();
    });

    test('should add a item to the order details', () => {
      return userCart.addItem(burger).then(order => {
        const order_details = ordering.order_details;
        const subtotal = burger.unit_price;
        const shippingCost = 0;
        expect(ordering.subtotal).toBe(subtotal);
        expect(ordering.total_cost).toBe(subtotal + shippingCost);
        expect(ordering.total_tax).toBe(subtotal * 0.1);
        expect(order_details).toHaveLength(1);
        expect(order_details[0].product).toBe(burger);
        expect(order_details[0].quantity).toBe(1);
        expect(order_details[0].total_price).toBe(burger.unit_price);
      });
    });

    test('should add 2 different items to the order details', () => {
      return Promise.all([
        userCart.addItem(burger),
        userCart.addItem(coke),
      ]).then(() => {
        const order_details = ordering.order_details;
        const subtotal = burger.unit_price + coke.unit_price;
        const shippingCost = 0;
        expect(ordering.subtotal).toBe(subtotal);
        expect(ordering.total_cost).toBe(subtotal + shippingCost);
        expect(ordering.total_tax).toBe(subtotal * 0.1);
        expect(order_details).toHaveLength(2);
        expect(order_details[0].product).toBe(burger);
        expect(order_details[0].quantity).toBe(1);
        expect(order_details[0].total_price).toBe(burger.unit_price);
        expect(order_details[1].product).toBe(coke);
        expect(order_details[1].quantity).toBe(1);
        expect(order_details[1].total_price).toBe(coke.unit_price);
      });
    });

    test('should increase the quantity if the item is in the list', () => {
      return Promise.all([
        userCart.addItem(burger),
        userCart.addItem(burger),
      ]).then(() => {
        const order_details = ordering.order_details;
        const subtotal = burger.unit_price * 2;
        const shippingCost = 0;
        expect(ordering.subtotal).toBe(subtotal);
        expect(ordering.total_cost).toBe(subtotal + shippingCost);
        expect(ordering.total_tax).toBe(subtotal * 0.1);
        expect(order_details).toHaveLength(1);
        expect(order_details[0].product).toBe(burger);
        expect(order_details[0].quantity).toBe(2);
        expect(order_details[0].total_price).toBe(burger.unit_price * 2);
      });
    });
  });

  describe('setQuantityOfItem', () => {
    const burger = exampleBill.order_details[0].product;
    const coke = exampleBill.order_details[1].product;
    let ordering;

    beforeEach(() => {
      jest
        .spyOn(shoppingCartSevice, 'createOrderIfnotExisted')
        .mockImplementation(() => Promise.resolve(null));
      jest
        .spyOn(orderRepository, 'getUncheckedoutOrder')
        .mockImplementation(senderId => Promise.resolve(ordering));
      jest
        .spyOn(orderRepository, 'update')
        .mockImplementation(order => (ordering = Object.assign({}, order)));

      jest
      .spyOn(orderRepository, 'update')
      .mockImplementation(order => (ordering = Object.assign({}, order)));
      ordering = Object.assign({}, exampleBill);
    });

    afterEach(() => {
      // getUncheckedoutOrder.restore();
      // createOrderIfnotExisted.restore();
      // orderUpdate.restore();
      jest.resetAllMocks();
    });

    test('should actively set quantity of an item in the order', () => {
      return userCart.setQuantityOfItem(burger, 3).then(() => {
        const order_details = ordering.order_details;
        const subtotal = burger.unit_price * 3 + coke.unit_price;
        const shippingCost = 0;
        const taxRate = 0.1;
        expect(ordering.subtotal).toBe(subtotal);
        expect(ordering.total_cost).toBe(subtotal + shippingCost);
        expect(ordering.total_tax).toBe(subtotal * taxRate);
        expect(order_details).toHaveLength(2);
        expect(order_details[0].product).toBe(burger);
        expect(order_details[0].quantity).toBe(3);
        expect(order_details[0].total_price).toBe(burger.unit_price * 3);
        expect(order_details[1].product).toBe(coke);
        expect(order_details[1].quantity).toBe(1);
        expect(order_details[1].total_price).toBe(coke.unit_price);
      });
    });

    test('should set to 0 if quantity parameter is smaller than 0', () => {
      return userCart.setQuantityOfItem(burger, -1).then(() => {
        const order_details = ordering.order_details;
        const subtotal = burger.unit_price * 0 + coke.unit_price;
        const shippingCost = 0;
        const taxRate = 0.1;
        expect(ordering.subtotal).toBe(subtotal);
        expect(ordering.total_cost).toBe(subtotal + shippingCost);
        expect(ordering.total_tax).toBe(subtotal * taxRate);
        expect(order_details).toHaveLength(2);
        expect(order_details[0].product).toBe(burger);
        expect(order_details[0].quantity).toBe(0);
        expect(order_details[0].total_price).toBe(burger.unit_price * 0);
        expect(order_details[1].product).toBe(coke);
        expect(order_details[1].quantity).toBe(1);
        expect(order_details[1].total_price).toBe(coke.unit_price);
      });
    });
  });

  describe('getCurrentOrder', () => {
    test('should get the current bill of user', () => {
      // const getUncheckedoutOrder
      //   .mockImplementation(() => Promise.resolve(null));
      return userCart.getCurrentOrder().then(() => {
        // getUncheckedoutOrder.restore();
        // expect(getUncheckedoutOrder).have.been.calledOnce; TODO
      });
    });
  });

  describe('removeCurrentOrder', () => {
    test('should remove an order', () => {
      const getCurrentOrder = jest
        .spyOn(userCart, 'getCurrentOrder')
        .mockImplementation(() => Promise.resolve(null));
      const remove = jest.spyOn(orderRepository, 'remove').mockImplementation(() => {});
      return userCart.removeCurrentOrder().then(() => {
        getCurrentOrder.restore();
        remove.restore();
        // expect(remove).have.been.calledOnce; TODO
      });
    });
  });

  describe('removeItem', () => {
    const burger = exampleBill.order_details[0].product;
    const coke = exampleBill.order_details[1].product;
    let getUncheckedoutOrder;
    let update;
    beforeEach(() => {
      getUncheckedoutOrder = jest.spyOn(
        orderRepository,
        'getUncheckedoutOrder'
      );
      update = jest
        .spyOn(orderRepository, 'update')
        .mockImplementation(order => (ordering = Object.assign({}, order)));
    });

    afterEach(() => {
      getUncheckedoutOrder.restore();
      update.restore();
    });

    test('should remove an item in order if there is only one', () => {
      getUncheckedoutOrder.mockImplementation(() =>
        Promise.resolve(
          Object.assign({}, exampleBill, {
            subtotal: 65000,
            total_cost: 65000,
            total_tax: 6500,
            order_details: [
              {
                quantity: 1,
                total_price: 65000,
                product: burger,
              },
            ],
          })
        )
      );
      return userCart.removeItem(burger).then(order => {
        getUncheckedoutOrder.restore();
        update.restore();
        const order_details = order.order_details;
        expect(order.subtotal).toBe(0);
        expect(order.total_cost).toBe(0);
        expect(order.total_tax).toBe(0);
        expect(order_details).toHaveLength(0);
      });
    });

    test('should remove an item in order if there are two items', () => {
      getUncheckedoutOrder.mockImplementation(() =>
        Promise.resolve(
          Object.assign({}, exampleBill, {
            subtotal: 85000,
            total_cost: 85000,
            total_tax: 8500,
            order_details: [
              {
                quantity: 1,
                total_price: 65000,
                product: burger,
              },
              {
                quantity: 1,
                total_price: 20000,
                product: coke,
              },
            ],
          })
        )
      );
      return userCart.removeItem(burger).then(order => {
        const order_details = order.order_details;
        const subtotal = coke.unit_price;
        const shippingCost = 0;
        const taxRate = 0.1;
        expect(order.subtotal).toBe(subtotal);
        expect(order.total_cost).toBe(subtotal + shippingCost);
        expect(order.total_tax).toBe((subtotal + shippingCost) * taxRate);
        expect(order_details).toHaveLength(1);
        expect(order_details[0].product).toBe(coke);
        expect(order_details[0].quantity).toBe(1);
        expect(order_details[0].total_price).toBe(coke.unit_price);
      });
    });
  });

  describe('deceaseQuantityOfItem', () => {
    const burger = exampleBill.order_details[0].product;
    const coke = exampleBill.order_details[1].product;
    let getUncheckedoutOrder;
    let update;
    beforeEach(() => {
      getUncheckedoutOrder = jest.spyOn(
        orderRepository,
        'getUncheckedoutOrder'
      );
      update = jest
        .spyOn(orderRepository, 'update')
        .mockImplementation(order => (ordering = Object.assign({}, order)));
    });

    afterEach(() => {
      getUncheckedoutOrder.restore();
      update.restore();
    });

    test('should decease one quantity of an item in order', () => {
      getUncheckedoutOrder.mockImplementation(() =>
        Promise.resolve(
          Object.assign({}, exampleBill, {
            subtotal: 215000,
            total_cost: 215000,
            total_tax: 21500,
            order_details: [
              {
                quantity: 3,
                total_price: 65000,
                product: burger,
              },
              {
                quantity: 1,
                total_price: 20000,
                product: coke,
              },
            ],
          })
        )
      );
      return userCart.deceaseQuantityOfItem(burger).then(order => {
        const order_details = order.order_details;
        const subtotal = burger.unit_price * 2 + coke.unit_price;
        const shippingCost = 0;
        const taxRate = 0.1;
        expect(order.subtotal).toBe(subtotal);
        expect(order.total_cost).toBe(subtotal + shippingCost);
        expect(order.total_tax).toBe((subtotal + shippingCost) * taxRate);
        expect(order_details).toHaveLength(2);
        expect(order_details[0].product).toBe(burger);
        expect(order_details[0].quantity).toBe(2);
        expect(order_details[0].total_price).toBe(burger.unit_price * 2);
        expect(order_details[1].product).toBe(coke);
        expect(order_details[1].quantity).toBe(1);
        expect(order_details[1].total_price).toBe(coke.unit_price);
      });
    });

    test('should decease two quantity of an item in order', () => {
      getUncheckedoutOrder.mockImplementation(() =>
        Promise.resolve(
          Object.assign({}, exampleBill, {
            subtotal: 215000,
            total_cost: 215000,
            total_tax: 21500,
            order_details: [
              {
                quantity: 3,
                total_price: 65000,
                product: burger,
              },
              {
                quantity: 1,
                total_price: 20000,
                product: coke,
              },
            ],
          })
        )
      );
      return userCart.deceaseQuantityOfItem(burger, 2).then(order => {
        const order_details = order.order_details;
        const subtotal = burger.unit_price + coke.unit_price;
        const shippingCost = 0;
        const taxRate = 0.1;
        expect(order.subtotal).toBe(subtotal);
        expect(order.total_cost).toBe(subtotal + shippingCost);
        expect(order.total_tax).toBe((subtotal + shippingCost) * taxRate);
        expect(order_details).toHaveLength(2);
        expect(order_details[0].product).toBe(burger);
        expect(order_details[0].quantity).toBe(1);
        expect(order_details[0].total_price).toBe(burger.unit_price);
        expect(order_details[1].product).toBe(coke);
        expect(order_details[1].quantity).toBe(1);
        expect(order_details[1].total_price).toBe(coke.unit_price);
      });
    });

    test('should decease none if input quantity is less than 0', () => {
      getUncheckedoutOrder.mockImplementation(() =>
        Promise.resolve(
          Object.assign({}, exampleBill, {
            subtotal: 215000,
            total_cost: 215000,
            total_tax: 21500,
            order_details: [
              {
                quantity: 3,
                total_price: 65000,
                product: burger,
              },
              {
                quantity: 1,
                total_price: 20000,
                product: coke,
              },
            ],
          })
        )
      );
      return userCart.deceaseQuantityOfItem(burger, 0).then(order => {
        const order_details = order.order_details;
        const subtotal = burger.unit_price * 3 + coke.unit_price;
        const shippingCost = 0;
        const taxRate = 0.1;
        expect(order.subtotal).toBe(subtotal);
        expect(order.total_cost).toBe(subtotal + shippingCost);
        expect(order.total_tax).toBe((subtotal + shippingCost) * taxRate);
        expect(order_details).toHaveLength(2);
        expect(order_details[0].product).toBe(burger);
        expect(order_details[0].quantity).toBe(3);
        expect(order_details[0].total_price).toBe(burger.unit_price * 3);
        expect(order_details[1].product).toBe(coke);
        expect(order_details[1].quantity).toBe(1);
        expect(order_details[1].total_price).toBe(coke.unit_price);
      });
    });
  });

  describe('changePaymentType', () => {
    test('should add a payment type', async () => {
      const newPaymentType = 'Credit Card';
      const payman = await userCart
      .changePaymentType(newPaymentType)
      .then(() => orderRepository.getUncheckedoutOrder(senderId))
      .then(order => order.payment_type)
      return expect(payman
      ).toBe(newPaymentType);
    });
  });

  describe('Shipping Address', () => {
    test.skip('should add a shipping address to bill', () => {
      const userOrder = shoppingCartSevice.forUser(senderId);
      const burger = productRepository.getBurgerByName('Big Mac');
      const coke = productRepository.getDrinkByName('Coca-Cola');
      return orderRepository
        .insert({
          order_id: Math.floor(Math.random() * 100000000),
          payment_type: 'Cash',
          currency: 'VND',
          subtotal: 215000,
          shipping_cost: 0,
          total_cost: 215000,
          total_tax: 21500,
          checkouted: false,
          checkoutTime: null,
          order_user: exampleBill.order_user,
          order_details: [
            {
              quantity: 3,
              total_price: 65000,
              product: burger,
            },
            {
              quantity: 1,
              total_price: 20000,
              product: coke,
            },
          ],
          shipping_address: null,
        })
        .then(() => userOrder.setShippingAddress(exampleBill.shipping_address))
        .then(() =>
          orderRepository.getUncheckedoutOrder(senderId).then(order => {
            expect(order.shipping_address).toBe(exampleBill.shipping_address);
          })
        );
    });

    test.skip('should get a shipping address from bill', () => {
      const userOrder = shoppingCartSevice.forUser(senderId);
      const burger = productRepository.getBurgerByName('Big Mac');
      const coke = productRepository.getDrinkByName('Coca-Cola');
      return orderRepository
        .insert({
          order_id: Math.floor(Math.random() * 100000000),
          payment_type: 'Cash',
          currency: 'VND',
          subtotal: 215000,
          shipping_cost: 0,
          total_cost: 215000,
          total_tax: 21500,
          checkouted: false,
          checkoutTime: null,
          order_user: exampleBill.order_user,
          order_details: [
            {
              quantity: 3,
              total_price: 65000,
              product: burger,
            },
            {
              quantity: 1,
              total_price: 20000,
              product: coke,
            },
          ],
          shipping_address: exampleBill.shipping_address,
        })
        .then(() => userOrder.getShippingAddress())
        .then(shipping_address =>
          expect(shipping_address).toBe(exampleBill.shipping_address)
        );
    });

    test.skip('should add a shipping address to bill', () => {
      const userOrder = shoppingCartSevice.forUser(senderId);
      const burger = productRepository.getBurgerByName('Big Mac');
      const coke = productRepository.getDrinkByName('Coca-Cola');
      return orderRepository
        .insert({
          order_id: Math.floor(Math.random() * 100000000),
          payment_type: 'Cash',
          currency: 'VND',
          subtotal: 215000,
          shipping_cost: 0,
          total_cost: 215000,
          total_tax: 21500,
          checkouted: false,
          checkoutTime: null,
          order_user: exampleBill.order_user,
          order_details: [
            {
              quantity: 3,
              total_price: 65000,
              product: burger,
            },
            {
              quantity: 1,
              total_price: 20000,
              product: coke,
            },
          ],
          shipping_address: null,
        })
        .then(() => userOrder.setShippingAddress(exampleBill.shipping_address))
        .then(() =>
          orderRepository.getUncheckedoutOrder(senderId).then(order => {
            expect(order.shipping_address).toBe(exampleBill.shipping_address);
          })
        );
    });
  });

  describe('checkout', () => {
    test('should get the recript', () => {
      const orderUpdate = jest
        .spyOn(orderRepository, 'update')
        .mockImplementation(order => order);
      const getUncheckedoutOrder = jest
        .spyOn(orderRepository, 'getUncheckedoutOrder')
        .mockImplementation(() =>
          Promise.resolve(
            Object.assign({}, exampleBill, {
              checkout: false,
              checkoutTime: null,
            })
          )
        );
      return userCart.checkout().then(order => {
        // orderUpdate.restore();
        // getUncheckedoutOrder.restore();
        expect(typeof order.checkoutTime).toBe('string');
        expect(order.checkouted).toBe(true);
        // expect(orderUpdate).have.been.calledOnce; change to jest
      });
    });
  });
});
