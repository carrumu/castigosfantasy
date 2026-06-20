const https = require('https');

console.log('Requesting google.com...');
https.get('https://www.google.com', (res) => {
  console.log('Success! Status code:', res.statusCode);
}).on('error', (e) => {
  console.error('Error occurred:', e);
});
