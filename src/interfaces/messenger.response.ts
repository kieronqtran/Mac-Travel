interface MessengerResponse {
  recipient: { id: string };
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
