const fetch = require('node-fetch');
console.log('Fetching single product blue-metal-handle-tote-bag...');
fetch('http://127.0.0.1:5000/api/products/blue-metal-handle-tote-bag')
  .then(res => {
    console.log('STATUS:', res.status);
    return res.json();
  })
  .then(json => console.log('RESPONSE:', JSON.stringify(json, null, 2)))
  .catch(err => console.error('ERROR:', err.message));
