import { Test } from '@nestjs/testing';

describe('ShoppingCartService', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({}).compile();
  });

  describe('addItem', () => {
    // test('should add a item to the order details', () => {
    //   return userCart.addItem(burger).then(order => {
    //     const order_details = ordering.order_details;
    //     const subtotal = burger.unit_price;
    //     const shippingCost = 0;
    //     expect(ordering.subtotal).toBe(subtotal);
    //     expect(ordering.total_cost).toBe(subtotal + shippingCost);
    //     expect(ordering.total_tax).toBe(subtotal * 0.1);
    //     expect(order_details).toHaveLength(1);
    //     expect(order_details[0].product).toBe(burger);
    //     expect(order_details[0].quantity).toBe(1);
    //     expect(order_details[0].total_price).toBe(burger.unit_price);
    //   });
    // });
  });
});
