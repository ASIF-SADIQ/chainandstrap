const fetch = require('node-fetch');
fetch('http://137.184.102.82:5000/api/products')
  .then(res => res.json())
  .then(json => console.log('SUCCESS:', json.success, 'count:', json.count))
  .catch(err => console.error('ERROR:', err.message));
