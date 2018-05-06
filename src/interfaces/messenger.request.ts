export interface MessengerRequest {
  object: 'page';
  entry: Entry[];
}

export interface Entry {
  id: string;
  time: number;
  messaging: Messaging[];
}

export interface Messaging {
  sender: Sender;
  recipient: Recipient;
  timestamp: number;
  message: Message;
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
