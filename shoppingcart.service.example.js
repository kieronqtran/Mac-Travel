const shoppingcartService = require('./service/shoppingcart.service');
const productRepository = require('./repository/product.repository');

function sendReceiptMessage(recipientId) {
  const shoppingCart = shoppingcartService.forUser(recipientId);
  return shoppingCart
    .checkout()
    .then(bill => {
      var messageData = {
        recipient: {
          id: recipientId,
        },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'receipt',
              recipient_name: bill.shipping_address.customer_name,
              order_number: bill.order_id,
              currency: bill.currency,
              payment_method: bill.payment_type,
              timestamp: bill.checkoutTime,
              elements: bill.order_details.map(order_detail => ({
                title: order_detail.product.name,
                subtitle: order_detail.product.description,
                quantity: order_detail.quantity,
                price: order_detail.total_price,
                currency: order_detail.product.currency,
                image_url: order_detail.product.image_url,
              })),
              address: null,
              summary: {
                subtotal: bill.subtotal,
                shipping_cost: bill.shipping_cost,
                total_tax: bill.total_tax,
                total_cost: bill.total_cost,
              },
            },
          },
        },
      };
      // add bill address if it exist.
      if (!!bill.shipping_address) {
        messageData.address = {
          street_1: bill.shipping_address.street,
          city: bill.shipping_address.city,
          postal_code: bill.shipping_address.postal_code,
          state: bill.shipping_address.state,
          country: bill.shipping_address.country,
        }
      }
    })
    .then(messageData => callSendAPI(messageData))
    .catch(err => {
      // send the error message to user here
    });
}

/**
 * Order {
      "id": {Number},
      "order_id": {String} Default: auto generated a string of number with length of 8
      "payment_type": {String} Default: Cash
      "currency": {String} Default: VND
      "subtotal": {Number} Default: 0
      "shipping_cost": {Number} Default: 0
      "total_cost": {Number} Default: 0
      "total_tax": {Number} Default: total_cose * 0.1 - 10% VAT
      "checkouted": {Boolean} Default: false - will set to be true only when user checkouted
      "checkoutTime": {String} Default: Date.now().toString() - the time bill is checkouted
      "updatedTime": {Number}
      "createdTime": {Number},
      "order_user": {User}
      "order_details": {<OrderDetails>[]}
      "shipping_address": {
        "customer_name": {String}
        "city": {String}
        "postal_code": {String}
        "state": {String}
        "street": {String}
        "country": {String}
      }
    }

    OrderDetails {
      "quantity": {Number}
      "total_price": {Number}
      "product": {Product}
    }

    Product: {
      "id": {Number} - Product Id,
      "name": {String} - Product Name,
      "type": {String} - Product Type (only Burger or Drink),
      "item_url": {String} - Item Url,
      "image_url": {String} - Image Url,
      "unit_price": {Number} - Price per product,
      "concurrency": {String} - Concurrent of Unit Price,
      "description": {String} - The description of product,
      "payload_name": {String} - The payload name
    }

    User {
      "id": {Number} - User Id
      "facebook_id": {String} - Sender Id
      "first_name": {String}
      "last_name": {String}
      "gender": {String}
      "timezone": {Number}
    }
 * @param {String} senderId by facebook
 * @param {String} payload item payload name
 */

// NOTE: not design for running
// add all the method is return {Promise}
function addAnItemtoShoppingCart(senderId, payload) {
  // to get the User Shopping Cart
  // forUser is the only method doesn't return Promise in the shopping cart service
  const shoppingCart = shoppingcartService.forUser(senderId);
  const item = productRepository.getItemByPayload(payload); // payload or id
  // add all the method is return {Promise}
  shoppingCart.createOrderIfnotExisted() // automate create order in the database
    // will always called no need to run
    .then(order => {

    });
  // aternative usage shoppingcartService.createOrderIfnotExisted(senderId);
  // note: the order will create automately if it is not existed
  // even if the createOrderIfnotExisted is not called.
  const orderPromise1 = shoppingCart.addItem(item); // have to pass the product object
  const orderPromise2 = shoppingCart.addItem(item); // add again will increase the quantity that product by 1
  const orderPromise3 = shoppingCart.setQuantityOfItem(item, 5); // explict set the item quantity
  const orderPromise4 = shoppingCart.deceaseQuantityOfItem(item); // decrease item quantity by 1
  const orderPromise5 = shoppingCart.deceaseQuantityOfItem(item, 2); // decrease item quantity by 2
  const orderPromise6 = shoppingCart.removeItem(item); // remove completely the item out of order
  shoppingCart.removeCurrentOrder(); // remove the whole order. return nothing
  const orderPromise7 = shoppingCart.getCurrentOrder(); // get the current bill order
  const orderPromise8 = shoppingCart.changePaymentType('Credit Card'); // set payment type

  const shipping_address = {
    "customer_name": "Quang Tran",
    "city": "Ho Chi Minh",
    "postal_code": "700000",
    "state": "HCM",
    "street": "702 Nguyen Van Linh",
    "country": "VN"
  };

  shoppingCart.setShippingAddress(shipping_address)
    .then(order => {

    });

  shoppingCart.getShippingAddress() // return the current shipping address
    .then(address => {
      // do something with shipping address here
    });

  // how to change shipping address
  shoppingCart.getShippingAddress()
    .then(address => {
      // set user address here
      // NOTE: if there is no address will return null
      // !!null === false
      // !!{} === true
      // !!!null === true
      // !!!{} === false
      if (!!address) { // to check if there is address in there
        address.street = '123 Le Duong';
      }
      return address;
    })
    .then(address1 => shoppingCart.setShippingAddress(address1));

  shoppingCart.hasItemInShoppingCart() // return true or false if there is an item in shopping cart
    .then(hasItem => {
      // do something with hasItem variable here
    });

  shoppingCart.checkout()
    .then(order => {
      // perform the checkout here
    })
}

function callSendAPI(messageData) {
  console.log(JSON.stringify(messageData, null, 4));
}
