const productRepository = require('./repository/product.repository');

// https://github.com/kieronqtran/Mac-Travel/blob/master/index.js#L307
// function sendBurgerMenu(recipientId) {
//   var messageData = {
//       recipient: {
//           id: recipientId
//       },
//       message: {
//           attachment: {
//               type: "template",
//               payload: {
//                   template_type: "generic",
//                   elements: [{
//                       title: "Big Mac",
//                       subtitle: "The one and only.",
//                       item_url: "https://www.mcdonalds.com/us/en-us/product/big-mac.html",
//                       image_url: "https://www.mcdonalds.com/content/dam/usa/promotions/mobile/extravaluemeal-mobile.jpg",
//                       buttons: [{
//                           type: "web_url",
//                           url: "https://www.mcdonalds.com/us/en-us/product/big-mac.html",
//                           title: "Open Website"
//                       }, {
//                           type: "postback",
//                           title: "Order This Burger",
//                           payload: "Big Mac",
//                       }, {
//                           type: "postback",
//                           title: "Exit",
//                           payload: "Exit Big Mac",
//                       }]
//                   }, {
//                       title: "Sweet BBQ Bacon",
//                       subtitle: "Tangy, Sweet, Juicy",
//                       item_url: "https://www.mcdonalds.com/us/en-us/product/sweet-bbq-bacon-burger-on-sesame-seed-bun-202504.html",
//                       image_url: "http://static6.businessinsider.com/image/590cea94dd08959c288b4aeb-1207/sweet%20bbq%20mcdonalds%20bacon%20burger.png",
//                       buttons: [{
//                           type: "web_url",
//                           url: "https://www.mcdonalds.com/us/en-us/product/sweet-bbq-bacon-burger-on-sesame-seed-bun-202504.html",
//                           title: "Open Website"
//                       }, {
//                           type: "postback",
//                           title: "Order This Burger",
//                           payload: "Sweet BBQ Bacon",
//                       }, {
//                           type: "postback",
//                           title: "Exit",
//                           payload: "Exit BBQ",
//                       }]
//                   }, {
//                       title: "Signature Sriracha Burger",
//                       subtitle: "Spicy meets saucy",
//                       item_url: "https://www.mcdonalds.com/us/en-us/product/sriracha-burger-on-artisan-roll.html",
//                       image_url: "http://del.h-cdn.co/assets/17/29/980x490/landscape-1500316280-sriracha-burger.png",
//                       buttons: [{
//                           type: "web_url",
//                           url: "https://www.mcdonalds.com/us/en-us/product/sriracha-burger-on-artisan-roll.html",
//                           title: "Open Website"
//                       }, {
//                           type: "postback",
//                           title: "Order This Burger",
//                           payload: "Signature Sriracha",
//                       }, {
//                           type: "postback",
//                           title: "Exit",
//                           payload: "Exit Signature",
//                       }]
//                   }]
//               }
//           }
//       }
//   };

//   callSendAPI(messageData);
// }
/**
 * This is an example of how to get the burgers data in db.json file.
 * An shortcut of above example
 * @param recipientId Messenger Sender Id
 */
function sendBurgerMenu(recipientId) {
  const burgers = productRepository.getAllBurgers(); // get all burgers in product
  // map all the product information to each facebook generic template
  const payloadElements = burgers.map(burger => {
    return {
      title: burger.name,
      subtitle: burger.description,
      item_url: burger.item_url,
      image_url: burger.image_url,
      buttons: [
        {
          type: 'web_url',
          url: burger.item_url,
          title: 'Open Website',
        },
        {
          type: 'postback',
          title: 'Order This Burger',
          payload: burger.payload_name,
        },
        {
          type: 'postback',
          title: 'Exit',
          payload: 'EXIT_' + burger.payload_name,
        },
      ],
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
  console.log(
    `BurgerMenu Messeage Data: ${JSON.stringify(messageData, null, 4)}`,
  );
}

/**
 * this is an example get the burger detail in the db.json file
 * @param name Burger Name
 */
function getABurgerDetailsByName(name) {
  const burger = productRepository.getBurgerByName(name);
  console.log(`This is a ${burger.name}.`);
}

function addABurgerToFile() {
  const burger = {
    name: 'Big Mac',
    type: 'Burger',
    item_url: 'https://www.mcdonalds.com/us/en-us/product/big-mac.html',
    image_url:
      'https://www.mcdonalds.com/content/dam/usa/promotions/mobile/extravaluemeal-mobile.jpg',
    unit_price: 65000,
    concurrency: 'VND',
    description: 'The one and only.',
    payload_name: 'BIG_MAC',
  };
  const addedBurger = productRepository.addProduct(burger);
  console.log(`Added Product ${JSON.stringify(addedBurger)}`);
}
