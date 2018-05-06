import { Component as Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { URL, URLSearchParams } from 'url';
import { environments } from '../utils';
import { LoggerService } from '../shared';
import { Order } from '../interfaces';

@Injectable()
export class OrderService {
  private readonly logger = LoggerService.create(OrderService.name);

  constructor(@Inject('OrderModelToken') private readonly orderModel: Model<Order>) {}

  async getById(id: string): Promise<Order> {
    return this.orderModel.findById(id);
  }

  async getAll(): Promise<Order> {
    throw Error('Method not implemented.');
  }

  async findWith(conditionObject): Promise<Order> {
    throw Error('Method not implemented.');
  }

  async findAllWith(propertyObject): Promise<Order> {
    throw Error('Method not implemented.');
  }

  async getUncheckedoutOrder(senderId): Promise<Order> {
    return null;
  }

  async insert(order): Promise<Order> {
    throw Error('Method not implemented.');
  }

  async update(order): Promise<Order> {
    throw Error('Method not implemented.');
  }

  async remove(orderOrId): Promise<Order> {
    throw Error('Method not implemented.');
  }
}
