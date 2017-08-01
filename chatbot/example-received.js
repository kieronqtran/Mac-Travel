/**
 * Created by kieronqtran on 7/28/17.
 */

const {
    sendTextMessage,
    sendImageMessage,
    sendGifMessage,
    sendAudioMessage,
    sendVideoMessage,
    sendFileMessage,
    sendButtonMessage,
    sendGenericMessage,
    sendReceiptMessage,
    sendQuickReply,
    sendReadReceipt,
    sendTypingOn,
    sendTypingOff,
    sendAccountLinking,
} = require('./example-send');

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
export function receivedAuthentication(event) {
    const senderID = event.sender.id;
    const recipientID = event.recipient.id;
    const timeOfAuth = event.timestamp;

    // The 'ref' field is set in the 'Send to Messenger' plugin,
    // in the 'data-ref' .The developer can set this to an arbitrary
    // value to associate the authentication callback with
    // the 'Send to Messenger' click event. This is
    // a way to do account linking when the user clicks the 'Send to Messenger'
    // plugin.
    const passThroughParam = event.optin.ref;

    console.log('Received authentication for user %d and page %d with pass ' +
        'through param \'%s\' at %d', senderID, recipientID, passThroughParam,
        timeOfAuth);

    // When an authentication is received,
    // we'll send a message back to the sender to
    // let them know it was successful.
    sendTextMessage(senderID, 'Authentication successful');
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message'
 * object format can consty depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've
 * created. If we receive a message with an attachment (image, video, audio),
 * then we'll simply confirm that we've received the attachment.
 *
 */
export function receivedMessage(event) {
    const senderID = event.sender.id;
    const recipientID = event.recipient.id;
    const timeOfMessage = event.timestamp;
    const message = event.message;

    console.log('Received message for user %d and page %d at %d with message:',
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    const isEcho = message.is_echo;
    const messageId = message.mid;
    const appId = message.app_id;
    const metadata = message.metadata;

    // You may get a text or attachment but not both
    const messageText = message.text;
    const messageAttachments = message.attachments;
    const quickReply = message.quick_reply;

    if (isEcho) {
        // Just logging message echoes to console
        console.log('Received echo for message %s and app %d with metadata %s',
            messageId, appId, metadata);
        return;
    } else if (quickReply) {
        const quickReplyPayload = quickReply.payload;
        console.log('Quick reply for message %s with payload %s',
            messageId, quickReplyPayload);

        sendTextMessage(senderID, 'Quick reply tapped');
        return;
    }

    if (messageText) {
        // If we receive a text message, check to see if it matches any special
        // keywords and send back the corresponding example.
        // Otherwise, just echo the text we received.
        switch (messageText) {
            case 'image':
                sendImageMessage(senderID);
                break;

            case 'gif':
                sendGifMessage(senderID);
                break;

            case 'audio':
                sendAudioMessage(senderID);
                break;

            case 'video':
                sendVideoMessage(senderID);
                break;

            case 'file':
                sendFileMessage(senderID);
                break;

            case 'button':
                sendButtonMessage(senderID);
                break;

            case 'generic':
                sendGenericMessage(senderID);
                break;

            case 'receipt':
                sendReceiptMessage(senderID);
                break;

            case 'quick reply':
                sendQuickReply(senderID);
                break;

            case 'read receipt':
                sendReadReceipt(senderID);
                break;

            case 'typing on':
                sendTypingOn(senderID);
                break;

            case 'typing off':
                sendTypingOff(senderID);
                break;

            case 'account linking':
                sendAccountLinking(senderID);
                break;

            case 'You\'re an awesome chatbot.':
                sendTextMessage(senderID, 'and you\'re an awesome human.');
                break;

            case 'Are you a human or a robot?':
                sendTextMessage(senderID,
                    'I am maybe a robot, or am I not? ' +
                    'Let me gives you a very simple answer. 42.');
                break;

            default:
                sendTextMessage(senderID, 'From Linh Branch' + messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, 'Message with attachment received');
    }
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
export function receivedDeliveryConfirmation(event) {
    // eslint-disable-next-line no-unused-vars
    const senderID = event.sender.id;
    // eslint-disable-next-line no-unused-vars
    const recipientID = event.recipient.id;
    const delivery = event.delivery;
    const messageIDs = delivery.mids;
    const watermark = delivery.watermark;
    // eslint-disable-next-line no-unused-vars
    const sequenceNumber = delivery.seq;

    if (messageIDs) {
        messageIDs.forEach(function(messageID) {
            console.log('Received delivery confirmation for message ID: %s',
                messageID);
        });
    }

    console.log('All message before %d were delivered.', watermark);
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
export function receivedPostback(event) {
    const senderID = event.sender.id;
    const recipientID = event.recipient.id;
    const timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field
    // which is set in a postback button for Structured Messages.
    const payload = event.postback.payload;

    console.log('Received postback for user %d ' +
        'and page %d with payload \'%s\' ' +
        'at %d', senderID, recipientID, payload, timeOfPostback);

    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
    sendTextMessage(senderID, 'Postback called');
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
export function receivedMessageRead(event) {
    // eslint-disable-next-line no-unused-vars
    const senderID = event.sender.id;
    // eslint-disable-next-line no-unused-vars
    const recipientID = event.recipient.id;

    // All messages before watermark (a timestamp) or sequence have been seen.
    const watermark = event.read.watermark;
    const sequenceNumber = event.read.seq;

    console.log('Received message read event for watermark %d and sequence ' +
        'number %d', watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
export function receivedAccountLink(event) {
    const senderID = event.sender.id;
    // eslint-disable-next-line no-unused-vars
    const recipientID = event.recipient.id;

    const status = event.account_linking.status;
    const authCode = event.account_linking.authorization_code;

    console.log('Received account link event with for user %d with status %s ' +
        'and auth code %s ', senderID, status, authCode);
}