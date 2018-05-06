import { UserService } from './user.service';
import { ShopingCartService } from './shopping-cart.service';
import { OrderService } from './order.service';
import { ProductService } from './product.service';

export const services = [ShopingCartService, UserService, OrderService, ProductService];

export { ShopingCartService, UserService, OrderService, ProductService };
