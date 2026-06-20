const https = require('https');

console.log('Requesting biwenger.as.com...');
https.get('https://biwenger.as.com/api/v2/user', (res) => {
  console.log('Status code:', res.statusCode);
}).on('error', (e) => {
  console.error('Error occurred:', e);
});
