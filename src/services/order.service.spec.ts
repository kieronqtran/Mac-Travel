import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { OrderService } from './order.service';
import { Order } from '../interfaces';
import { orderProvider, databaseProvider, mockgoose } from '../providers';
import { environments } from '../utils';

describe('OrderService', () => {
  let orderService: OrderService;
  let order: Model<Order>;
  let exampleOrder = {
    order_id: '59656934',
    payment_type: 'Cash',
    currency: 'VND',
    subtotal: 85000,
    shipping_cost: 2000,
    total_cost: 87000,
    total_tax: 8700,
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
          image_url: 'https://www.mcdonalds.com/content/dam/usa/promotions/mobile/extravaluemeal-mobile.jpg',
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
          item_url: 'https://www.mcdonalds.com/us/en-us/product/coffee-small.html',
          image_url: 'http://cdn0.wideopeneats.com/wp-content/uploads/2016/12/mccafe.jpg',
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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      components: [OrderService, databaseProvider, orderProvider],
    }).compile();

    orderService = module.get(OrderService);
    order = module.get('OrderModelToken');
  });

  afterEach(async () => {
    await mockgoose.helper.reset();
    jest.resetAllMocks();
  });

  test.skip('should get an order', async () => {
    const expectedOrder = exampleOrder;
    expect(await orderService.getById(1)).toEqual(expectedOrder);
  });

  // test('should get all the order', () => {
  //   let expectedOrder = Object.assign({}, exampleOrder);
  //   return expect([{}] || orderService.getAll()).toHaveLength(1);
  // });

  // test('should get an order with condition', () => {
  //   return expect(
  //     // orderRepository.findAllWith({
  //     //   order_user: {facebook_id: exampleOrder.order_user.facebook_id},
  //     // })
  //     [exampleOrder],
  //   ).toEqual([exampleOrder]);
  // });

  // test('should get an unchecked out order', async () => {
  //   const expectedOrder = await orderService.insert({
  //     order_id: Math.floor(Math.random() * 100000000).toString(),
  //     payment_type: 'Cash',
  //     currency: 'VND',
  //     subtotal: 0,
  //     shipping_cost: 0,
  //     total_cost: 0,
  //     total_tax: 0,
  //     checkouted: false,
  //     checkoutTime: null,
  //     order_user: exampleOrder.order_user,
  //     order_details: [],
  //     shipping_address: null,
  //   });
  //   // expect(orderRepository.getUncheckedoutOrder(exampleOrder.order_user.facebook_id)).toBe(expectedOrder)
  // });

  // test('should find a particular order', () => {
  //   return expect(
  //     // orderRepository.findWith({
  //     //   order_user: {facebook_id: exampleOrder.order_user.facebook_id},
  //     // })
  //     exampleOrder,
  //   ).toEqual(exampleOrder);
  // });

  // test('should add an order to db', async () => {
  //   let expectedOrder = Object.assign({}, exampleOrder, { id: undefined });
  //   const order = await orderService.insert(expectedOrder);
  //   expect(order.id).toBe(8); // expected to be 2
  // });

  // test('should remove an order', async () => {
  //   let expectedOrder = Object.assign({}, exampleOrder, { id: undefined });
  //   const order = await Promise.resolve(db.upsert(expectedOrder).write());
  //   const deletedOrder = await orderService.remove(order);
  //   expect(db.getById(deletedOrder.id).value()).toBeUndefined();
  // });

  // test('should update an order', async () => {
  //   const orderList = await orderService.getAll();
  //   const updatedOrder = await orderService.update(Object.assign({}, orderList[0], { order_id: '123456' }));
  //   const resultOrder = await orderService.getById(updatedOrder.id);
  //   expect(resultOrder._id).toBe('123456');
  // });
});
