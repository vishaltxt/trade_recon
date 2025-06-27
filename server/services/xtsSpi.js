// xtsSpi.js
const WebSocket = require('ws');

const connectSpi = (token) => {
  const socketUrl = `wss://xts.compositeapps.net/interactive/stream?token=${token}`;
  const ws = new WebSocket(socketUrl);

  ws.on('open', () => {
    console.log('✅ SPI Connected');

    // Subscribe to quotes
    const subscription = {
      requestType: 'SUBSCRIBE',
      streamingType: 'QUOTE',
      symbol: ['26000'], // instrumentId as string
      xtsMessageCode: 1501, // Full market quote
      broadcastMode: 'FULL'
    };

    ws.send(JSON.stringify(subscription));
  });

  ws.on('message', (msg) => {
    console.log('📥 Market Data:', msg.toString());
  });

  ws.on('error', (err) => {
    console.error('❌ SPI Error:', err);
  });

  ws.on('close', () => {
    console.log('SPI Connection closed');
  });
};

module.exports = connectSpi;
