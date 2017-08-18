const orderRepository = require('../repository/order.repository');
const database = require('../db');
const db = database.get('orders');

describe('Orders Repository', () => {
  const exampleOrder = {
    id: 1,
    order_id: '59656934',
    payment_type: 'Cash',
    concurrency: 'VND',
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
          description: 'The one and only.',
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
          description: 'Invigorate your morning.',
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

  beforeEach(() => {});

  afterEach(() => {});

  it('should get an order', () => {
    return orderRepository.getById(1).should.be.eql(expectedOrder);
  });

  it('should update an order', () => {});
});
