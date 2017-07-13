const fs = require('fs');
const random = require('generate-random-data');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017/jsinsa';

const generateOnData = (filename, limit) => {
  var counter = 0;
  const writableStream = fs.createWriteStream(filename);

  MongoClient.connect(url)
    .then((db) => {
      const collection = db.collection('movies');
      const stream = limit
        ? collection.find().limit(limit).stream()
        : collection.find().stream();

      stream.on('data', (data) => {
        counter++;
        const runtime = random.int(30, 180);
        writableStream.write(`${data._id}:${runtime}\n`);
        if (counter % 100000 === 0) {
          console.log(`${counter} read so far...`);
        }
      });

      stream.on('end', () => {
        console.log(`Read ${counter} documents from db`);
        console.log('Done!');
        writableStream.end();
      });
    });
};

generateOnData('runtimes.txt', 6000);
generateOnData('all-runtimes.txt');
