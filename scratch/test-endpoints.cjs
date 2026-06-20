const https = require('https');

const email = 'ytnoxgames@gmail.com';
const password = 'contraseñaprueba';

// Login first
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

const req = https.request(loginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    const token = data.token;
    testEndpoints(token);
  });
});
req.write(loginData);
req.end();

function testEndpoints(token) {
  const endpoints = [
    '/api/v2/account',
    '/api/v2/user/leagues',
    '/api/v2/user'
  ];
  
  endpoints.forEach((path) => {
    const options = {
      hostname: 'biwenger.as.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Version': 'h3g456hj',
        'X-League': '0', // try dummy league ID
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`Path: ${path} | Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(JSON.stringify(JSON.parse(body), null, 2).substring(0, 1000));
        } else {
          console.log(body);
        }
      });
    });
    req.end();
  });
}
