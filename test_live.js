const fetch = require('node-fetch');
fetch('https://chainandstrap.com')
  .then(res => console.log('STATUS:', res.status))
  .catch(err => console.error('ERROR:', err.message));
