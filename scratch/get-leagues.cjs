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
    const token = data.token;
    console.log('Login successful! Token:', token.substring(0, 10) + '...');
    
    // 2. Fetch User Leagues
    fetchUserLeagues(token);
  });
});

req.on('error', (e) => console.error('Login request error:', e));
req.write(loginData);
req.end();

function fetchUserLeagues(token) {
  const options = {
    hostname: 'biwenger.as.com',
    port: 443,
    path: '/api/v2/user',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Version': 'h3g456hj',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };
  
  console.log('Fetching user leagues...');
  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      if (res.statusCode !== 200) {
        console.error('Fetch user failed:', res.statusCode, body);
        return;
      }
      const data = JSON.parse(body);
      console.log('User data response:');
      console.log(JSON.stringify(data, null, 2));
    });
  });
  
  req.on('error', (e) => console.error('User request error:', e));
  req.end();
}
