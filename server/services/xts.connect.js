// xtsAuth.js
const axios = require('axios');

const getXtsToken = async () => {
  const payload = {
    secretKey: '<YOUR_SECRET_KEY>',
    appKey: '<YOUR_APP_KEY>',
    source: 'WEB'
  };

  const response = await axios.post(
    'https://xts.compositeapps.net/interactive/user/session',
    payload
  );

  const token = response.data.result.token;
  console.log('Token:', token);
  return token;
};

module.exports = getXtsToken;
