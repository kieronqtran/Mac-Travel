const orderRepository = require('../repository/order.repository');
const database = require('../db');
const util = require('./util/util');
const db = database.get('orders');

describe('Orders Repository', () => {
  const exampleOrder = {
    "id": 1,
    "order_id": "59656934",
    "payment_type": "Cash",
    "currency": "VND",
    "subtotal": 85000,
    "shipping_cost": 2000,
    "total_cost": 87000,
    "total_tax": 8700,
    "checkouted": true,
    "timestamp": "1428444852",
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
  }

  beforeEach(() => {
    util.flushDb();
  });

  afterEach(() => {
    util.flushDb();
  });

  it('should get an order', () => {
    const expectedOrder = exampleOrder;
    return orderRepository
      .getById(1)
      .should.eventually.be.eql(expectedOrder);
  });

  it('should get all the order', () => {
    let expectedOrder = Object.assign({}, exampleOrder);
    return orderRepository
      .getAll()
      .should.eventually.have.lengthOf(1);
  });

  it('should get order with condition', () => {
    return orderRepository
      .findAllWith({ order_user: { facebook_id: exampleOrder.order_user.facebook_id } })
      .should.eventually.to.eql([exampleOrder]);
  });

  it('should find a particular order', () => {
    return orderRepository
      .findWith({ order_user: { facebook_id: exampleOrder.order_user.facebook_id } })
      .should.eventually.to.eql(exampleOrder);
  });

  it('should add an order to db', () => {
    let expectedOrder = Object.assign({}, exampleOrder);
    delete expectedOrder.id;
    return orderRepository
      .insert(expectedOrder)
      .then(order => {
        return order.id;
      })
      .should.eventually.to.equal(2);
  });

  it('should remove an order', () => {
    let expectedOrder = Object.assign({}, exampleOrder);
    delete expectedOrder.id;
    return db
      .upsert(expectedOrder)
      .write()
      .then(order => {
        orderRepository.remove(order);
        return order;
      })
      .then(order => {
        return db.getById(order.id).value();
      })
      .should.eventually.to.be.undefined;
  });

  it('should update an order', () => {
    return orderRepository
      .getAll()
      .then(list => list[0])
      .then(order => orderRepository
        .update(Object.assign({}, order, { order_id: "123456" }))
      )
      .then(order => orderRepository.getById(order.id))
      .then(order => order.order_id)
      .should.eventually.to.equal("123456");
  });
});
