const fetch = require('node-fetch');

async function test() {
  console.log('Testing category=bags...');
  const resBags = await fetch('http://127.0.0.1:5000/api/products?category=bags');
  const dataBags = await resBags.json();
  console.log('BAGS TOTAL:', dataBags.total, 'COUNT:', dataBags.count);

  console.log('\nTesting category=shoes...');
  const resShoes = await fetch('http://127.0.0.1:5000/api/products?category=shoes');
  const dataShoes = await resShoes.json();
  console.log('SHOES TOTAL:', dataShoes.total, 'COUNT:', dataShoes.count);

  console.log('\nTesting category=watches...');
  const resWatches = await fetch('http://127.0.0.1:5000/api/products?category=watches');
  const dataWatches = await resWatches.json();
  console.log('WATCHES TOTAL:', dataWatches.total, 'COUNT:', dataWatches.count);
}

test();
