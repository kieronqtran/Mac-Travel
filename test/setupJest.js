require('isomorphic-fetch');
jest.setTimeout(120000);

process.env.MESSENGER_PAGE_ACCESS_TOKEN = 'this_is_a_fake_token';
process.env.MESSENGER_CALLBACK_URL = 'https://graph.facebook.com/v2.12/me';
process.env.MESSENGER_APP_SECRET = 'this_is_a_fake_app_secret';
process.env.SERVER_URL = 'http://localhost';
