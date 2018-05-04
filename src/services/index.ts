import { UserService } from './user.service';
import { shoppingCartProvider, ShopingCartService } from './shopping-cart.service';

export const services = [shoppingCartProvider, UserService];

export { shoppingCartProvider, ShopingCartService, UserService };
