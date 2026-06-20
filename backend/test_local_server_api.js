const fetch = require('node-fetch');
console.log('Fetching products from local server on port 5000...');
fetch('http://127.0.0.1:5000/api/products?limit=12&skip=0')
  .then(res => {
    console.log('STATUS:', res.status);
    return res.json();
  })
  .then(json => console.log('RESPONSE:', JSON.stringify(json, null, 2).substring(0, 1000)))
  .catch(err => console.error('ERROR:', err.message));
