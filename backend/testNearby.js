const http = require('http');
http.get('http://localhost:5000/api/providers/nearby?lat=16.2313&lng=80.5387', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(data); });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
