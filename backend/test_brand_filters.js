const fetch = require('node-fetch');

async function test() {
  console.log('Testing brand=LV...');
  const res = await fetch('http://127.0.0.1:5000/api/products?brand=LV');
  const data = await res.json();
  console.log('LV TOTAL:', data.total, 'COUNT:', data.count);

  console.log('\nTesting brand=Consignment Bags...');
  const resConsignment = await fetch('http://127.0.0.1:5000/api/products?brand=Consignment+Bags');
  const dataConsignment = await resConsignment.json();
  console.log('CONSIGNMENT BAGS TOTAL:', dataConsignment.total, 'COUNT:', dataConsignment.count);
}

test();
