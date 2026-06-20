const https = require('https');

const email = 'ytnoxgames@gmail.com';
const password = 'contraseñaprueba';

// 1. Login
const loginData = JSON.stringify({ email, password });
const loginOptions = {
  hostname: 'biwenger.as.com',
  port: 443,
  path: '/api/v2/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

console.log('Logging in to Biwenger...');
const req = https.request(loginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error('Login failed with status:', res.statusCode, body);
      return;
    }
    const data = JSON.parse(body);
    console.log('Full login response structure:');
    console.log(JSON.stringify(data, null, 2));
  });
});

req.on('error', (e) => console.error('Login request error:', e));
req.write(loginData);
req.end();
