const shoppingcartService = require('./service/shoppingcart.service');

function sendReceiptMessage(recipientId) {
  shoppingcartService
    .forUser(recipientId)
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
              elements: bill.order_details.map(order_detail => {
                return {
                  title: order_detail.product.name,
                  subtitle: order_detail.product.description,
                  quantity: order_detail.quantity,
                  price: order_detail.total_price,
                  currency: order_detail.product.currency,
                  image_url: order_detail.product.image_url,
                };
              }),
              address: {
                street_1: bill.shipping_address.street,
                city: bill.shipping_address.city,
                postal_code: bill.shipping_address.postal_code,
                state: bill.shipping_address.state,
                country: bill.shipping_address.country,
              },
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
    })
    .then(messageData => callSendAPI(messageData));
}

function callSendAPI(messageData) {
  console.log(JSON.stringify(messageData, null, 4));
}
