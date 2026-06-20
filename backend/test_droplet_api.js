const fetch = require('node-fetch');
console.log('Fetching products from droplet backend directly...');
fetch('http://137.184.102.82:5000/api/products?limit=2')
  .then(res => {
    console.log('STATUS:', res.status);
    return res.text();
  })
  .then(text => console.log('RESPONSE:', text.substring(0, 1000)))
  .catch(err => console.error('ERROR:', err.message));
