'use strict';

const bodyParser = require('body-parser');
const  express = require('express');
const request = require('request');

const app = express();
app.set('port', process.env.PORT || 5000);
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Hi! This is my chatbot.');
});


// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.APP_SECRET);

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ;


// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.FB_ACCESS_TOKEN) ;


// URL where the app is running (include protocol). Used to point to scripts and 
// assets located at this address. 
const SERVER_URL = (process.env.SERVER_URL);


if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
    console.error("Missing config values");
    process.exit(1);
}

// Validating token
app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === "this_is_my_token") {
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
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function(pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function(messagingEvent) {
                if (messagingEvent.message) {
                    receivedMessage(messagingEvent);
                } else if (messagingEvent.postback) {
                    processPostback(messagingEvent);
                } else if (messagingEvent.delivery) {
                    receivedDeliveryConfirmation(messagingEvent);
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



function checkTime(senderID){
    var date = new Date();
    var hour = date.getHours() + 7;
    //var x = time + 8;
    if (hour < 12)
    { sendTextMessage(senderID, "Good morning, customer");  }
    if (hour >= 12 && hour < 18)
    { sendTextMessage(senderID, "Good afternoon, customer"); }
    if (hour >= 18 && hour < 21)
    { sendTextMessage(senderID, "Good evening, customer");  }
    if (hour >=21) {  sendTextMessage(senderID, "Good night, customer");  }
}

// List of Answers:
let feelingArray = ["I'm very good. Thank you for asking :)", "I'm doing very well today :). Thank you!",
    "I'm fine. Thank you very much!", "Very well my friend."];


function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;

    // You may get a text or attachment but not both
    var messageText = message.text;

    top:
        if(messageText){
            switch (messageText.toLowerCase()){
                case "what is your website":
                case "can i see your website":
                    sendTextMessage(senderID, "Our main page is: https://www.mcdonalds.com/us/en-us.html");
                    break top;

                case "how are you":
                case "how are you doing":
                    let randomIndex = Math.floor(Math.random() * feelingArray.length);
                    let feeling = feelingArray[randomIndex];
                    sendTextMessage(senderID, feeling);
                    break top;
                case "good morning":
                case "morning":
                    sendTextMessage(senderID, "Good morning my dearest customer.");
                    break top;
                case "good afternoon":
                    sendTextMessage(senderID, "Good afternoon to my beloved customer :).");
                    break top;
                case "good evening":
                    sendTextMessage(senderID, "Good evening, my customer :).");
                    break top;
                case "good night":
                    sendTextMessage(senderID, "Good night, my customer.");
                    break top;
                case "i want to order":
                case "i want something to eat":
                    sendTextMessage(senderID, "This is our menu. Please click on the option that you want.");
                    sendMenuMessage(senderID);
                    break top;

                case "i want to buy some burgers":
                case "i want to buy a burger":
                    sendTextMessage(senderID, "We have the best burgers in town. Please click on the option that you want.");
                    sendBurgerMenu(senderID);
                    break top;

                case "i want some drink":
                    sendTextMessage(senderID, "This is our drink menu. Please click on the option that you want.");
                    sendDrinkMenu(senderID);
                    break top;

                default:
                    var messageList = messageText.split(/[\s,]+/);
                    for(let i = 0; i < messageList.length; i++){
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
                                sendTextMessage(senderID, "Please click on the option that you want.");
                                sendMenuMessage(senderID);
                                break top;

                            case "burger":
                            case "burgers":
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

                            default:
                                if(i == (messageList.length - 1)){
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
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;

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
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a generic message using the Send API.
 */
function sendMenuMessage(recipientId) {
    var messageData = {
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
                            payload: "Burger Menu",
                        }, {
                            type: "postback",
                            title: "Drink Menu",
                            payload: "Drink Menu",
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}


function sendBurgerMenu(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Big Mac",
                        subtitle: "The one and only.",
                        item_url: "https://www.mcdonalds.com/us/en-us/product/big-mac.html",
                        image_url: "https://www.mcdonalds.com/content/dam/usa/promotions/mobile/extravaluemeal-mobile.jpg",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.mcdonalds.com/us/en-us/product/big-mac.html",
                            title: "Open Website"
                        }, {
                            type: "postback",
                            title: "Order This Burger",
                            payload: "Big Mac",
                        }, {
                            type: "postback",
                            title: "Exit",
                            payload: "Exit Big Mac",
                        }]
                    },{
                        title: "Sweet BBQ Bacon",
                        subtitle: "Tangy, Sweet, Juicy",
                        item_url: "https://www.mcdonalds.com/us/en-us/product/sweet-bbq-bacon-burger-on-sesame-seed-bun-202504.html",
                        image_url: "http://static6.businessinsider.com/image/590cea94dd08959c288b4aeb-1207/sweet%20bbq%20mcdonalds%20bacon%20burger.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.mcdonalds.com/us/en-us/product/sweet-bbq-bacon-burger-on-sesame-seed-bun-202504.html",
                            title: "Open Website"
                        }, {
                            type: "postback",
                            title: "Order This Burger",
                            payload: "Sweet BBQ Bacon",
                        }, {
                            type: "postback",
                            title: "Exit",
                            payload: "Exit BBQ",
                        }]
                    }, {
                        title: "Signature Sriracha Burger",
                        subtitle: "Spicy meets saucy",
                        item_url: "https://www.mcdonalds.com/us/en-us/product/sriracha-burger-on-artisan-roll.html",
                        image_url: "http://del.h-cdn.co/assets/17/29/980x490/landscape-1500316280-sriracha-burger.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.mcdonalds.com/us/en-us/product/sriracha-burger-on-artisan-roll.html",
                            title: "Open Website"
                        }, {
                            type: "postback",
                            title: "Order This Burger",
                            payload: "Signature Sriracha",
                        }, {
                            type: "postback",
                            title: "Exit",
                            payload: "Exit Signature",
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

function sendDrinkMenu(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Chocolate Shake",
                        subtitle: "Chocolaty perfection.",
                        item_url: "https://www.mcdonalds.com/us/en-us/product/chocolate-shake-small.html",
                        image_url: "http://s.eatthis-cdn.com/media/images/ext/907498607/mcdonalds-menu-dessert-shake-chocolate.jpg",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.mcdonalds.com/us/en-us/product/chocolate-shake-small.html",
                            title: "Open Website"
                        }, {
                            type: "postback",
                            title: "Order This Drink",
                            payload: "Chocolate Shake",
                        }, {
                            type: "postback",
                            title: "Exit",
                            payload: "Exit Chocolate",
                        }]
                    },{
                        title: "Coca-Cola",
                        subtitle: "The burger's companion.",
                        item_url: "https://www.mcdonalds.com/us/en-us/product/coca-cola-small.html",
                        image_url: "https://technabob.com/blog/wp-content/uploads/2017/03/mcdonalds_coke_1.jpg",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.mcdonalds.com/us/en-us/product/coca-cola-small.html",
                            title: "Open Website"
                        }, {
                            type: "postback",
                            title: "Order This Drink",
                            payload: "Coca Cola",
                        }, {
                            type: "postback",
                            title: "Exit",
                            payload: "Exit Cola",
                        }]
                    },{
                        title: "McCafé Coffee",
                        subtitle: "Invigorate your morning.",
                        item_url: "https://www.mcdonalds.com/us/en-us/product/coffee-small.html",
                        image_url: "http://cdn0.wideopeneats.com/wp-content/uploads/2016/12/mccafe.jpg",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.mcdonalds.com/us/en-us/product/coffee-small.html",
                            title: "Open Website"
                        }, {
                            type: "postback",
                            title: "Order This Drink",
                            payload: "Mc Coffee",
                        }, {
                            type: "postback",
                            title: "Exit",
                            payload: "Exit Coffee",
                        }]
                    }, {
                        title: "Strawberry Shake",
                        subtitle: "A real sweetie.",
                        item_url: "https://www.mcdonalds.com/us/en-us/product/strawberry-shake-small.html",
                        image_url: "http://thatoregonlife.com/wp-content/uploads/2016/03/mccafe2.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.mcdonalds.com/us/en-us/product/strawberry-shake-small.html",
                            title: "Open Website"
                        }, {
                            type: "postback",
                            title: "Order This Drink",
                            payload: "Strawberry Shake",
                        }, {
                            type: "postback",
                            title: "Exit",
                            payload: "Exit Strawberry",
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var delivery = event.delivery;
    var messageIDs = delivery.mids;
    var watermark = delivery.watermark;
    var sequenceNumber = delivery.seq;

    if (messageIDs) {
        messageIDs.forEach(function(messageID) {
            console.log("Received delivery confirmation for message ID: %s",
                messageID);
        });
    }

    console.log("All message before %d were delivered.", watermark);
}

function confirmingOrder(recipientId, foodType) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Please confirm your order: " + foodType,
                    buttons:[{
                        type: "postback",
                        title: "Yes",
                        payload: "Confirm"
                    }, {
                        type: "postback",
                        title: "No",
                        payload: "Decline"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}


function processPostback(event) {
    var senderId = event.sender.id;
    var payload = event.postback.payload;
    if (payload === "Greeting") {
        request({
            url: "https://graph.facebook.com/v2.6/" + senderId,
            qs: {
                access_token: PAGE_ACCESS_TOKEN,
                fields: "first_name"
            },
            method: "GET"
        }, function(error, response, body) {
            var greeting = "";
            if (error) {
                console.log("Error getting user's name: " +  error);
            } else {
                var bodyObj = JSON.parse(body);
                var name = bodyObj.first_name;
                greeting = "Hi " + name + ". ";
            }
            var message = greeting + "Welcome to MACTravel for the first time.";
            sendMessage(senderId, {text: message});
        });
    } else if (payload === "Burger Menu"){
        sendMessage(senderId, {text: "Please click on the option that you want."});
        sendBurgerMenu(senderId);
    } else if (payload === "Drink Menu"){
        sendMessage(senderId, {text: "Please click on the option that you want."});
        sendDrinkMenu(senderId);
    } else if (payload === "Big Mac"){
        confirmingOrder(senderId, "Big Mac");
    } else if (payload === "Sweet BBQ Bacon"){
        confirmingOrder(senderId, "Sweet BBQ Bacon");
    } else if (payload === "Signature Sriracha") {
        confirmingOrder(senderId, "Signature Sriracha");
    } else if (payload === "Chocolate Shake") {
        confirmingOrder(senderId, "Chocolate Shake");
    } else if (payload === "Coca Cola") {
        confirmingOrder(senderId, "Coca Cola");
    } else if (payload === "Mc Coffee") {
        confirmingOrder(senderId, "Mc Cafe");
    } else if (payload === "Strawberry Shake") {
        confirmingOrder(senderId, "Strawberry Shake");
    } else if (payload === "Exit Big Mac"){
        sendMessage(senderId, {text: "Perhaps you don't love Big Mac. Please tell me what you like."});
    } else if (payload === "Exit BBQ"){
        sendMessage(senderId, {text: "Maybe Sweet BBQ Bacon is not for today. Please tell me what I should do next."});
    } else if (payload === "Exit Signature"){
        sendMessage(senderId, {text: "Signature Sriracha Burger might not be your favorite, but please tell me other options"});
    } else if (payload === "Exit Chocolate"){
        sendMessage(senderId, {text: "You can still choose our different drink."});
    } else if (payload === "Exit Cola"){
        sendMessage(senderId, {text: "Perhaps you want something else. Please tell me what you like."});
    } else if (payload === "Exit Coffee"){
        sendMessage(senderId, {text: "Perhaps you like to have something else. Please tell me what's next"});
    } else if (payload === "Exit Strawberry"){
        sendMessage(senderId, {text: "I'm sorry. It might not your favorite, but we have different drink. Please type your interest"});
    }

}



function sendMessage(recipientId, message) {
    request({
        url: "https://graph.facebook.com/v2.9/me/messages",
        qs: {access_token: PAGE_ACCESS_TOKEN},
        method: "POST",
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("Error sending message: " + response.error);
        }
    });
}



/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.9/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            if (messageId) {
                console.log("Successfully sent message with id %s to recipient %s",
                    messageId, recipientId);
            } else {
                console.log("Successfully called Send API for recipient %s",
                    recipientId);
            }
        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }
    });
}

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

module.exports = app;