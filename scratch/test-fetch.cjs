console.log('Testing native fetch to api.biwenger.com...');

fetch('https://api.biwenger.com/v2/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  body: JSON.stringify({ email: 'test@example.com', password: 'test' })
})
.then(res => {
  console.log('Status:', res.status);
  return res.text();
})
.then(text => {
  console.log('Body:', text);
})
.catch(err => {
  console.error('Fetch error:', err);
});
