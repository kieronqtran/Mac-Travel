import {URL, URLSearchParams} from 'url';
import * as fetch from 'node-fetch';
import {camelizeKeys, decamelizeKeys} from 'humps';
import {Component} from '@nestjs/common';

interface MessengerResponse {
  recipient: {id: string};
}

interface QuickReplyResponse extends MessengerResponse {
  message: {
    text: string;
    quick_replies: [
      {
        content_type: 'text';
        title: string;
        payload: string;
      }
    ];
  };
}

interface SuccessResponse {
  recipientId: string;
  messageId: string;
}

const FB_API_URL = 'https://graph.facebook.com/v2.12/me';
const PAGE_ACCESS_TOKEN = '';

@Component()
export class FacebookSendApiUtils {
  async send(payload: MessengerResponse, queryString = {}, path = '/messages') {
    try {
      const url = new URL(FB_API_URL + path);
      const params = new URLSearchParams();
      params.append('access_token', PAGE_ACCESS_TOKEN);
      Object.keys(queryString).forEach(key =>
        params.append(key, queryString[key])
      );
      url.search = params.toString();
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(decamelizeKeys(payload)),
      });
      const body = camelizeKeys(await response.json()) as SuccessResponse;
      return body;
    } catch (error) {
      return null;
    }
  }

  async quickReply(
    psid: string,
    text: string,
    title: string,
    postback_payload
  ) {
    const payload = {
      recipient: {
        id: psid,
      },
      message: {
        text,
        quick_replies: [
          {
            content_type: 'text',
            title,
            payload: postback_payload,
          },
        ],
      },
    } as QuickReplyResponse;

    return this.send(payload);
  }

  async textMessage(psid: string) {
    const payload = {
      recipient: {
        id: psid,
      },
    };
    return this.send(payload);
  }

  async typingOn(psid: string) {
    const payload = {
      recipient: {
        id: psid,
      },
      sender_action: 'typing_on',
    };
    return this.send(payload);
  }

  async typingOff(psid: string) {
    const payload = {
      recipient: {
        id: psid,
      },
      sender_action: 'typing_on',
    };
    return this.send(payload);
  }

  async receiptMessage(psid: string) {
    // Generate a random receipt ID as the API requires a unique ID
    const receiptId = 'order' + Math.floor(Math.random() * 1000);

    const messageData = {
      recipient: {
        id: psid,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'receipt',
            recipient_name: 'Peter Chang',
            order_number: receiptId,
            currency: 'USD',
            payment_method: 'Visa 1234',
            timestamp: '1428444852',
            elements: [],
            address: {
              street_1: '1 Hacker Way',
              street_2: '',
              city: 'Menlo Park',
              postal_code: '94025',
              state: 'CA',
              country: 'US',
            },
            summary: {
              subtotal: 698.99,
              shipping_cost: 20.0,
              total_tax: 57.67,
              total_cost: 626.66,
            },
            adjustments: [
              {
                name: 'New Customer Discount',
                amount: -50,
              },
              {
                name: '$100 Off Coupon',
                amount: -100,
              },
            ],
          },
        },
      },
    };
    return this.send(messageData);
  }

  /*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
  async genericMessage(recipientId) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: 'rift',
                subtitle: 'Next-generation virtual reality',
                item_url: 'https://www.oculus.com/en-us/rift/',
                image_url: '/assets/rift.png',
                buttons: [
                  {
                    type: 'web_url',
                    url: 'https://www.oculus.com/en-us/rift/',
                    title: 'Open Web URL',
                  },
                  {
                    type: 'postback',
                    title: 'Call Postback',
                    payload: 'Payload for first bubble',
                  },
                ],
              },
              {
                title: 'touch',
                subtitle: 'Your Hands, Now in VR',
                item_url: 'https://www.oculus.com/en-us/touch/',
                image_url: '/assets/touch.png',
                buttons: [
                  {
                    type: 'web_url',
                    url: 'https://www.oculus.com/en-us/touch/',
                    title: 'Open Web URL',
                  },
                  {
                    type: 'postback',
                    title: 'Call Postback',
                    payload: 'Payload for second bubble',
                  },
                ],
              },
            ],
          },
        },
      },
    };

    return this.send(messageData);
  }
}

export interface Sender {
  id: string;
}

export interface Recipient {
  id: string;
}

export interface Payload {
  url: string;
  sticker_id: number;
}

export interface Attachment {
  type: string;
  payload: Payload;
}

export interface Message {
  mid: string;
  seq: number;
  sticker_id: number;
  attachments: Attachment[];
}

export interface Messaging {
  sender: Sender;
  recipient: Recipient;
  timestamp: number;
  message: Message;
}

export interface Entry {
  id: string;
  time: number;
  messaging: Messaging[];
}

export interface RootObject {
  object: string;
  entry: Entry[];
}
