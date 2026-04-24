const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.get('http://localhost:5000/api/taskers/nearby?lat=16.2274&lng=80.5375');
    console.log('Status:', res.status);
    console.log('Success:', res.data.success);
    console.log('Taskers found:', res.data.taskers.length);
    console.log('Names:', res.data.taskers.map(t => t.name).join(', '));
  } catch (error) {
    console.error('Error:', error.response ? error.response.status : error.message);
    if (error.response) console.error('Data:', error.response.data);
  }
}

testApi();
