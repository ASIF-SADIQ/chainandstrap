const fetch = require('node-fetch');
console.log('Fetching from HTTPS domain...');
fetch('https://chainandstraps.live/backend-api/products?limit=2')
  .then(res => {
    console.log('STATUS:', res.status);
    return res.text();
  })
  .then(text => console.log('RESPONSE:', text.substring(0, 1000)))
  .catch(err => console.error('ERROR:', err.message));
