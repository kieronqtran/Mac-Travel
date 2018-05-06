import { Component as Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { URL, URLSearchParams } from 'url';
import { environments } from '../utils';
import { LoggerService } from '../shared';
import { Product } from '../interfaces';
const productData: Product[] = require('../fixtures/products.json');

@Injectable()
export class ProductService implements OnModuleInit {
  private readonly logger = LoggerService.create(ProductService.name);

  constructor(@Inject('ProductModelToken') private readonly productModel: Model<Product>) {}

  async onModuleInit() {
    // TODO: add product fixture data to database if is not existed
    const count = await this.productModel.count({}).exec();
    if (count === 0) {
      try {
        this.logger.log('Initialize Products to Database');
        const result = await this.productModel.insertMany(productData);
        this.logger.log(`${result.length} items inserted`);
        this.logger.debug(`Products: \n${JSON.stringify(result, null, 4)}`);
      } catch (error) {
        this.logger.error('initial product error' + JSON.stringify(error));
      }
    }
  }

  async getAllBurgers() {
    throw Error('Method not implemented.');
  }

  /**
   * return <Product>[] list of drinks
   */
  async getAllDrinks() {
    throw Error('Method not implemented.');
  }

  /**
   * return <Product>[] list of all food
   */
  async getAllProducts() {
    throw Error('Method not implemented.');
  }

  /**
   * return <Product>[] list of payload name
   */
  async getAllPayLoads() {
    throw Error('Method not implemented.');
  }

  async findProductById(id: string) {
    throw Error('Method not implemented.');
  }

  async getProductById(id: string) {
    throw Error('Method not implemented.');
  }

  async getProductByName(name: string) {
    throw Error('Method not implemented.');
  }

  async getItemByPayload(payload: string) {
    throw Error('Method not implemented.');
  }
}
