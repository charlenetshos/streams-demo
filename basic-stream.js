const fs = require('fs');

const readStream = fs.createReadStream('people.txt');

readStream.on('data', (chunk) => {
  console.log(`chunk size: ${chunk.length}`);
});