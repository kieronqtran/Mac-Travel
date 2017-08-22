'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const rp = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const {
  APP_SECRET,
  VALIDATION_TOKEN,
  PAGE_ACCESS_TOKEN,
  SERVER_URL,
  DATABASE_LOCATION,
  } = require('./config');
const productRepository = require('./repository/product.repository');
const userRepository = require('./repository/user.repository');
const shoppingCartSevice = require('./service/shoppingcart.service');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

const app = express();
app.set('port', process.env.PORT || 5000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hi! This is my chatbot.');
});

// Access to db.json from browser with URI /db
app.get('/db', function (req, res) {
  fs.readFile(path.resolve(__dirname, DATABASE_LOCATION), 'utf8',
    function (err, data) {
      if (err) {
        return console.error(err);
      }
      res.send(`<pre>${data}</pre>`);
    });
});

// Validating token
app.get('/webhook', function (req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Invalid token.");
    res.sendStatus(403);
  }
});

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', function (req, res) {
  const data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function (pageEntry) {
      const pageID = pageEntry.id;
      const timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function (messagingEvent) {
        if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.postback) {
          processPostback(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

function checkTime(senderID) {
  return userRepository
    .getUserByFacebookId(senderID)
    .then(user => {
      const date = new Date();
      const hour = date.getHours() + user.timezone;
      if (hour < 12)
        return `Good morning, ${user.first_name}`;
      if (hour >= 12 && hour < 18)
        return `Good afternoon, ${user.first_name}`;
      if (hour >= 18 && hour < 21)
        return `Good evening, ${user.first_name}`;
      if (hour >= 21)
        return `Good night, ${user.first_name}`;
    })
    .then(messege => sendTextMessage(senderID, messege))
}

// List of Answers:
let feelingArray = [
  "I'm very good. Thank you for asking :)",
  "I'm doing very well today :). Thank you!",
  "I'm fine. Thank you very much!", "Very well.",
];

function receivedMessage(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message, null, 4));

  const messageId = message.mid;
  const appId = message.app_id;
  const metadata = message.metadata;

  // You may get a text or attachment but not both
  const messageText = message.text;

  top:
  if (messageText) {
    switch (messageText.toLowerCase()) {
      case "what is your website":
      case "can i see your website":
        sendTextMessage(senderID, "Our main page is: https://www.mcdonalds.com/us/en-us.html");
        break;

      case "how are you":
      case "how are you doing":
        let randomIndex = Math.floor(Math.random() * feelingArray.length);
        let feeling = feelingArray[randomIndex];
        sendTextMessage(senderID, feeling);
        break;
      case "good morning":
      case "morning":
        sendTextMessage(senderID, "Good morning my dearest customer.");
        break;
      case "good afternoon":
        sendTextMessage(senderID, "Good afternoon to my beloved customer :).");
        break;
      case "good evening":
        sendTextMessage(senderID, "Good evening, my customer :).");
        break;
      case "good night":
        sendTextMessage(senderID, "Good night, my customer.");
        break;
      case "i want to order":
      case "i want something to eat":
        sendTextMessage(senderID, "This is our menu. Please click on the option that you want.");
        sendMenuMessage(senderID);
        break;

      case "i want to buy some burgers":
      case "i want to buy a burger":
        sendTextMessage(senderID, "We have the best burgers in town. Please click on the option that you want.");
        sendBurgerMenu(senderID);
        break;

      case 'big macs':
      case 'big mac':
        sendBigMac(senderID);
        break;

      case "i want some drink":
        sendTextMessage(senderID, "This is our drink menu. Please click on the option that you want.");
        sendDrinkMenu(senderID);
        break;

      case 'show order':
      //TODO: implement show order here

      default:
        const messageList = messageText.split(/[\s,]+/);
        for (let i = 0; i < messageList.length; i++) {
          let message = messageList[i];
          message = message.toLowerCase();
          switch (message) {
            case 'hi':
            case 'hello':
              checkTime(senderID);
              break top;

            case 'menu':
            case 'order':
            case 'eat':
              sendTextMessage(senderID, "This is our menu. Please click on the option that you want.");
              sendMenuMessage(senderID);
              break top;

            case 'burger':
            case 'burgers':
              sendTextMessage(senderID, "We have different kinds of burger. Please click on the option that you want.");
              sendBurgerMenu(senderID);
              break top;

            case 'drink':
            case 'beverage':
              sendTextMessage(senderID, "The drink menu is sent to you. Please click on the option that you want.");
              sendDrinkMenu(senderID);
              break top;

            case 'website':
              sendTextMessage(senderID, "Do you mean our website? If yes, this is it https://www.mcdonalds.com/us/en-us.html");
              break top;

            case 'bigmac':
            case 'big mac':
            case 'bigmacs':
            case 'big macs':
              sendBigMac(senderID);
              break top;

            case 'checkout':
            //TODO: implement checkout function here

            case 'website':
              sendTextMessage(senderID, "Do you mean our website? If yes, this is it https://www.mcdonalds.com/us/en-us.html");
              break top;
            default:
              if (i == (messageList.length - 1)) {
                sendTextMessage(senderID, "I don't quite catch that. Please try again");
                break top;
              }
              else continue;
          }
        }
    }
  }
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
function receivedPostback(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  const payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  // Always return promise even it's null
  return callSendAPI(messageData);
}

/*
 * Send a generic message using the Send API.
 */
function sendMenuMessage(recipientId) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Welcome to MACTravel\'s page",
            subtitle: "Take a Food Tour of our Full Menu",
            item_url: "https://www.mcdonalds.com/us/en-us/full-menu.html",
            image_url: "https://www.mcdonalds.com/content/dam/usa/promotions/desktop/OFYQ_960x542.jpg",
            buttons: [{
              type: "web_url",
              url: "https://www.mcdonalds.com/us/en-us/full-menu.html",
              title: "Open Website"
            }, {
              type: "postback",
              title: "Burger Menu",
              payload: "BURGER_MENU",
            }, {
              type: "postback",
              title: "Drink Menu",
              payload: "DRINK_MENU",
            }]
          }]
        }
      }
    }
  };

  // Always return promise even it's null
  return callSendAPI(messageData);
}


function sendBurgerMenu(recipientId) {
  const burgers = productRepository.getAllBurgers(); // get all burgers in product
  // map all the product information to each facebook generic template
  const payloadElements = burgers.map(burger => {
    return {
      title: burger.name,
      subtitle: burger.description,
      item_url: burger.item_url,
      image_url: burger.image_url,
      buttons: [{
        type: 'web_url',
        url: burger.item_url,
        title: 'Open Website',
      }, {
        type: 'postback',
        title: 'Order This Burger',
        payload: burger.payload_name,
      }, {
        type: 'postback',
        title: 'Exit',
        payload: 'EXIT_' + burger.payload_name,
      }],
    };
  });
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: payloadElements,
        },
      },
    },
  };

  // Always return promise even it's null
  return callSendAPI(messageData);
}

function sendDrinkMenu(recipientId) {
  const drinks = productRepository.getAllDrinks();
  const payloadElements = drinks.map(drink => {
    return {
      title: drink.name,
      subtitle: drink.description,
      item_url: drink.item_url,
      image_url: drink.image_url,
      buttons: [{
        type: 'web_url',
        url: drink.item_url,
        title: 'Open Website',
      }, {
        type: 'postback',
        title: 'Order This Drink',
        payload: drink.payload_name,
      }, {
        type: 'postback',
        title: 'Exit',
        payload: 'EXIT_' + drink.payload_name,
      }],
    };
  });
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: payloadElements
        }
      }
    }
  };
  // Always return promise even it's null
  return callSendAPI(messageData);
}

function sendBigMac(recipientId) {
  const burger = productRepository.getBurgerByName('Big Mac');
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: burger.name,
            subtitle: burger.description,
            item_url: burger.item_url,
            image_url: burger.image_url,
            buttons: [{
              type: 'web_url',
              url: burger.item_url,
              title: 'Open Website',
            }, {
              type: 'postback',
              title: 'Order This Drink',
              payload: burger.payload_name,
            }, {
              type: 'postback',
              title: 'Exit',
              payload: 'EXIT_' + burger.payload_name,
            }],
          }]
        }
      }
    }
  };

  // Always return promise even it's null
  return callSendAPI(messageData);
}

function confirmingOrder(recipientId, product) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Confirmation: if you want " + product.name + " add to your order.",
          buttons: [{
            type: "postback",
            title: "Yes",
            payload: "CONFIRM_" + productname
          }, {
            type: "postback",
            title: "No",
            payload: "DECLINE"
          }]
        }
      }
    }
  };
  // Always return promise even it's null
  return callSendAPI(messageData);
}

function processPostback(event) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;
  if (payload === "Greeting") { // ?? When this payload is called?
    userRepository.getUserByFacebookId(senderId)
      .then(user => `Hi ${user.gender === 'male' ? 'Mr.' : 'Ms.'} ${user.last_name} .Welcome to MACTravel for the first time.`)
      .then(() => sendMessage(senderId, { text: message }));
  } else if (payload === "BURGER_MENU") {
    sendMessage(senderId, { text: "Select your options:" });
    sendBurgerMenu(senderId);
  } else if (payload === "DRINK_MENU") {
    sendMessage(senderId, { text: "Select your options:" });
    sendDrinkMenu(senderId);
  } else if (productRepository
    .getAllPayLoads()
    .some(p => p === payload)) { // will check if the payload is matching any payloads in the db
    const item = productRepository.getItemByPayload(payload);
    confirmingOrder(senderId, item);
  } else if (/EXIT_/.test(payload)) {
    const extractedPayload = payload.split('EXIT_')[1];
    const item = productRepository.getItemByPayload(extractedPayload);
    sendMessage(senderId, {
      text:
      `Type 'menu' to continue to your order\n
       Type 'show order' to see what you have ordered \n
       Type 'checkout' to finish your order.` });
  } else if (/CONFIRM_/.test(payload)) {
    const extractedPayload = payload.split('CONFIRM_')[1];
    const item = productRepository.getItemByPayload(extractedPayload);
    shoppingCartSevice
      .forUser(senderId)
      .addItem(item)
      // The sending messages should guide users what to do next.
      .then(() => sendMessage(senderId,
        {
          text: `Adding ${item.name} is successful.
        Type 'menu' to continue to your order
        Type 'show order' to see what you have ordered
        Type 'checkout' to finish your order.` }));
  } else if (/DECLINE_/.test(payload)) {
    const extractedPayload = payload.split('DECLINE_')[1];
    const item = productRepository.getItemByPayload(extractedPayload);
    sendMessage(senderId,
      {
        text: `${item.name} has declined.
      Type 'menu' to continue to your order
      Type 'show order' to see what you have ordered
      Type 'checkout' to finish your order.` });
  }
}

// Duplicate logic with sendTextMessage
function sendMessage(recipientId, message) {
  return rp.post({
    url: "https://graph.facebook.com/v2.9/me/messages",
    qs: { access_token: PAGE_ACCESS_TOKEN },
    json: {
      recipient: { id: recipientId },
      message: message,
    }
  }).then(res => {
    const recipientId = res.recipient_id;
    const messageId = res.message_id;
    if (messageId) {
      console.log("Successfully sent message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.log("Successfully called Send API for recipient %s",
        recipientId);
    }
    return res;
  }).catch(body => console.error("Failed calling Send API", body.statusCode, body.message, body.error));
}


function sendReceiptMessage(recipientId) {
  return shoppingcartService
    .forUser(recipientId)
    .checkout()
    .then(bill => {
      const messageData = {
        recipient: {
          id: recipientId,
        },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'receipt',
              recipient_name: bill.shipping_address.customer_name,
              order_number: "Order_" + bill.order_id,
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
    .then(messageData => callSendAPI(messageData));
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData) {
  return rp
    .post({
      url: 'https://graph.facebook.com/v2.9/me/messages',
      qs: {
        access_token: PAGE_ACCESS_TOKEN,
      },
      json: messageData,
    })
    .then(res => {
      const recipientId = res.recipient_id;
      const messageId = res.message_id;
      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
        console.log("Successfully called Send API for recipient %s",
          recipientId);
      }
      return res;
    })
    .catch(body => console.error("Failed calling Send API", body.statusCode, body.message, body.error));
}

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
