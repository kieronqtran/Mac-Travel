import { Component as Injectable, Inject } from '@nestjs/common';
import { UserService } from './';
import { LoggerService } from '../shared';

class ShopingCartServiceInstance {
  private readonly logger = LoggerService.create('ShopingCartService');

  constructor(private readonly userService: UserService, private readonly senderId: string) {}

  async addItem() {}

  async changePaymentType() {}

  async checkout() {}

  async createOrderIfnotExisted(senderId: string) {
    const user = await this.userService.getUserByFacebookId(senderId);
    // const order = await orderRepository.getUncheckedoutOrder(senderId)
    // return order
    //   ? order
    //   : orderRepository.insert({
    //       order_id: Math.floor(Math.random() * 100000000).toString(),
    //       payment_type: defaultConstraint.paymentType,
    //       currency: defaultConstraint.currency,
    //       subtotal: 0,
    //       shipping_cost: 0,
    //       total_cost: 0,
    //       total_tax: 0,
    //       checkouted: false,
    //       checkoutTime: null,
    //       order_user: user,
    //       order_details: [],
    //       shipping_address: null,
    //     });
  }

  async deceaseQuantityOfItem() {}

  async hasItemInShoppingCart() {}

  async removeCurrentOrder() {}

  async removeItem() {}

  async getCurrentOrder() {}

  async setQuantityOfItem() {}

  async setShippingAddress() {}

  async getShippingAddress() {}
}

export interface ShopingCartService {
  forUser: (senderId: string) => ShopingCartServiceInstance;
}

export const shoppingCartProvider = {
  provide: 'ShopingCartService',
  useFactory: (userService: UserService) => ({
    forUser: (senderId: string) => {
      return new ShopingCartServiceInstance(userService, senderId);
    },
  }),
  inject: [UserService],
};
