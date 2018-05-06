import { userProvider } from './user.provider';
import { productProvider } from './product.provider';
import { orderProvider } from './order.provider';
import { databaseProvider, mockgoose } from './database.provider';

export const providers = [userProvider, productProvider, orderProvider, databaseProvider];

export { userProvider, productProvider, orderProvider, databaseProvider, mockgoose };
