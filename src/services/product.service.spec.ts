import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { ProductService } from './';
import { Product } from '../interfaces';
import { productProvider, databaseProvider, mockgoose } from '../providers';
import { environments } from '../utils';

describe('ProductService', () => {
  let productService: ProductService;
  let product: Model<Product>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      components: [ProductService, databaseProvider, productProvider],
    }).compile();

    productService = module.get(ProductService);
    product = module.get('ProductModelToken');
  });

  afterEach(async () => {
    await mockgoose.helper.reset();
    jest.resetAllMocks();
  });

  describe('getAllBurgers', () => {
    test('should fetch allBurgers', async () => {});
  });
});
