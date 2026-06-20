const https = require('https');
const crypto = require('crypto');

// Chrome-like ciphers
const ciphers = [
  'TLS_AES_256_GCM_SHA384',
  'TLS_CHACHA20_POLY1305_SHA256',
  'TLS_AES_128_GCM_SHA256',
  'ECDHE-ECDSA-AES128-GCM-SHA256',
  'ECDHE-RSA-AES128-GCM-SHA256',
  'ECDHE-ECDSA-AES256-GCM-SHA384',
  'ECDHE-RSA-AES256-GCM-SHA384',
  'ECDHE-ECDSA-CHACHA20-POLY1305',
  'ECDHE-RSA-CHACHA20-POLY1305',
  'DHE-RSA-AES128-GCM-SHA256',
  'DHE-RSA-AES256-GCM-SHA384'
].join(':');

const agent = new https.Agent({
  ciphers: ciphers,
  honorCipherOrder: true,
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  keepAlive: false
});

const options = {
  hostname: 'api.biwenger.com',
  port: 443,
  path: '/v2/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://biwenger.as.com',
    'Referer': 'https://biwenger.as.com/'
  },
  agent: agent
};

console.log('Testing request with custom browser-like ciphers...');

const req = https.request(options, (res) => {
  console.log('Success! Status code:', res.statusCode);
  let data = '';
  res.on('data', (d) => {
    data += d;
  });
  res.on('end', () => {
    console.log('Response body:', data);
  });
});

req.on('socket', (socket) => {
  socket.on('secureConnect', () => {
    console.log('Secure connection established! Protocol:', socket.getProtocol());
  });
});

req.on('error', (e) => {
  console.error('Error occurred:', e);
});

req.write(JSON.stringify({ email: 'test@example.com', password: 'test' }));
req.end();
