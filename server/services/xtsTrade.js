// xtsTrade.js
const axios = require('axios');

const placeOrder = async (token) => {
  const headers = {
    authorization: token
  };

  const body = {
    exchangeSegment: 2,
    productType: 'NRML',
    orderType: 'LIMIT',
    orderSide: 'BUY',
    instrumentId: 26000, // Replace with correct instrument ID
    quantity: 1,
    price: 500,
    disclosedQuantity: 0,
    timeInForce: 'DAY'
  };

  const response = await axios.post(
    'https://xts.compositeapps.net/interactive/order/place',
    body,
    { headers }
  );

  console.log('Order Response:', response.data);
};

module.exports = placeOrder;
