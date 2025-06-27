// index.js
const getXtsToken = require('./xtsAuth');
const placeOrder = require('./xtsTrade');
const connectSpi = require('./xtsSpi');

const run = async () => {
  const token = await getXtsToken();
  connectSpi(token);
  await placeOrder(token);
};

run();
