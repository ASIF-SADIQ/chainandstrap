const fetch = require('node-fetch');
fetch('http://localhost:5000/api/products?limit=2')
  .then(res => res.json())
  .then(json => console.log('SUCCESS PRODUCTS NEW:', json))
  .catch(err => console.error('ERROR PRODUCTS NEW:', err.message));
