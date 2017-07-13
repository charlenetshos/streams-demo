const fs = require('fs');
const split = require('split2');
const pressure = require('pressure-stream');
const { MongoClient, ObjectID } = require('mongodb');

const connectToDb = () =>
  MongoClient
    .connect('mongodb://localhost:27017/jsinsa')
    .then((db) => db.collection('movies'));

const parseMovieLine = line => {
  const [ _id, runtime ] = line.split(':');
  return { _id, runtime };
};

const update = filename => {
  let write = 0;
  let read = 0;

  connectToDb()
    .then((moviesCollection) => {
      const splitStream = fs
        .createReadStream(filename, 'UTF-8')
        .pipe(split());

      splitStream.pipe(pressure((row, cb) => {
        const movie = parseMovieLine(row);
        const _id = new ObjectID(movie._id);
        const runtime = parseInt(movie.runtime, 10);

        moviesCollection.findOneAndUpdate({ _id }, { $set: { runtime } })
          .then(() => {
            if (++write % 1000 === 0) {
              console.log(`Updated ${write} movies so far...`);
            }

            if (write === read) {
              console.log('Done updating!!!');
              process.exit();
            }
            cb();
          });
      }, { low: 50, high: 80 }));

      splitStream.on('data', () => {
        read++;
      });
    });
};

update('all-runtimes.txt');
