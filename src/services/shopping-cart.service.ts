import { Inject, Component as Injectable } from '@nestjs/common';
import { UserService, ProductService, OrderService } from './';
import { LoggerService } from '../shared';
import { Order, ShippingAddress, Product } from '../interfaces';

const defaultConstraint = {
  paymentType: 'Cash',
  taxRate: 0.1, // 10% VAT tax
  shoppingCost: 0,
  currency: 'VND',
};

class ShopingCartServiceInstance {
  private readonly logger = LoggerService.create('ShopingCartService');

  constructor(
    private readonly userService: UserService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly senderId: string,
  ) {}

  async addItem(item: Product) {
    return await this.createOrderIfnotExisted()
      .then(() => this.orderService.getUncheckedoutOrder(this.senderId))
      .then(order => {
        if (order.order_details.length === 0 || !order.order_details.find(od => od.product.id === item.id)) {
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
          const order_detail = order.order_details.find(od => od.product.id === item.id);
          order_detail.quantity = order_detail.quantity + 1;
          order_detail.total_price = order_detail.product.unit_price * order_detail.quantity;
          const item_index = order.order_details.findIndex(od => od.product.id === item.id);
          order.order_details[item_index] = order_detail;
          order.subtotal += order_detail.product.unit_price;
          order.total_cost += order_detail.product.unit_price;
          order.total_tax = order.total_cost * defaultConstraint.taxRate;
        }
        return this.orderService.update(order);
      });
  }

  async changePaymentType(paymentType: string) {
    return this.createOrderIfnotExisted()
      .then(() => this.orderService.getUncheckedoutOrder(this.senderId))
      .then(order => {
        order.payment_type = paymentType;
        return order;
      })
      .then(order => this.orderService.update(order));
  }

  async checkout() {
    return await this.orderService.getUncheckedoutOrder(this.senderId).then(order => {
      order.checkouted = true;
      order.checkoutTime = Math.floor(Date.now() / 1000).toString();
      return this.orderService.update(order);
    });
  }

  async createOrderIfnotExisted() {
    const user = await this.userService.getUserByFacebookId(this.senderId);
    const order = await this.orderService.getUncheckedoutOrder(this.senderId);
    return order
      ? order
      : await this.orderService.insert({
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
  }

  async deceaseQuantityOfItem(senderId, item, quantity) {
    const order = await this.orderService.getUncheckedoutOrder(senderId);
    const itemOfOrderDetail = order.order_details.find(od => od.product.id === item.id);
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
      this.setQuantityOfItem(senderId, item, defaultQuantity);
    }
    return this.orderService.update(order);
  }

  async hasItemInShoppingCart() {
    return this.createOrderIfnotExisted()
      .then(() => this.orderService.getUncheckedoutOrder(this.senderId))
      .then(order => order.order_details.length > 0);
  }

  async removeCurrentOrder() {
    const order = await this.orderService.getUncheckedoutOrder(this.senderId);
    return await this.orderService.remove(order);
  }

  async removeItem(item: Product) {
    return await this.orderService.getUncheckedoutOrder(this.senderId).then(order => {
      const order_details = order.order_details;
      if (order_details.length > 0) {
        order.order_details = order.order_details.filter(o => o.product.id !== item.id);
        if (order.order_details.length === 0) {
          order.subtotal = 0;
          order.total_cost = 0;
          order.total_tax = 0;
        } else {
          order.subtotal = order.order_details.reduce((previous, current) => previous + current.total_price, 0);
          order.total_cost = order.subtotal + order.shipping_cost;
          order.total_tax = order.total_cost * defaultConstraint.taxRate;
        }
      }
      return this.orderService.update(order);
    });
  }

  async getCurrentOrder(): Promise<Order> {
    return await this.orderService.getUncheckedoutOrder(this.senderId).then(order => (order ? order : this.createOrderIfnotExisted()));
  }

  async setQuantityOfItem(senderId, item, quantity) {
    const order = await this.orderService.getUncheckedoutOrder(senderId);
    if (order.order_details.length === 0 || !order.order_details.find(od => od.product.id === item.id)) {
      return this.addItem(item);
    }
    if (quantity > -1) {
      const order_detail = order.order_details.find(od => od.product.id === item.id);
      order_detail.quantity = quantity;
      order_detail.total_price = order_detail.product.unit_price * order_detail.quantity;
      const item_index = order.order_details.findIndex(od => od.product.id === item.id);
      order.order_details[item_index] = order_detail;
      order.subtotal = order.order_details.reduce((previous, current) => previous + current.total_price, 0);
      order.total_cost = order.subtotal + order.shipping_cost;
      order.total_tax = order.total_cost * defaultConstraint.taxRate;
      return this.orderService.update(order);
    }
    //TODO: Need refactor to smaller code size
    const order_detail = order.order_details.find(od => od.product.id === item.id);
    order_detail.quantity = 0;
    order_detail.total_price = order_detail.product.unit_price * order_detail.quantity;
    const item_index = order.order_details.findIndex(od => od.product.id === item.id);
    order.order_details[item_index] = order_detail;
    order.subtotal = order.order_details.reduce((previous, current) => previous + current.total_price, 0);
    order.total_cost = order.subtotal + order.shipping_cost;
    order.total_tax = order.total_cost * defaultConstraint.taxRate;
    return this.orderService.update(order);
  }

  async setShippingAddress(shipping_address: ShippingAddress) {
    const current = await this.getCurrentOrder();
    current.shipping_address = shipping_address;
    return await this.orderService.update(current);
  }

  async getShippingAddress() {
    const order = await this.getCurrentOrder();
    return order.shipping_address;
  }
}

// export interface ShopingCartService {
//   forUser: (senderId: string) => ShopingCartServiceInstance;
// }
@Injectable()
export class ShopingCartService {
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(OrderService) private readonly orderService: OrderService,
    @Inject(ProductService) private readonly productService: ProductService,
  ) {}

  public forUser(senderId: string) {
    return new ShopingCartServiceInstance(this.userService, this.orderService, this.productService, senderId);
  }
}

// export const shoppingCartProvider = {
//   provide: 'ShopingCartService',
//   useFactory: (userService: UserService, orderService: OrderService, productService: ProductService) => {
//     return {
//       forUser: (senderId: string) => {
//         return new ShopingCartServiceInstance(userService, orderService, productService, senderId);
//       },
//     };
//   },
//   inject: [UserService, OrderService, ProductService],
// };
