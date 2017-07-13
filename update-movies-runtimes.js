const fs = require('fs');
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
  let isDone = false;
  let write = 0;
  let read = 0;

  const data = fs.readFileSync(filename).toString();

  const movies = data
    .split('\n')
    .filter(movie => movie)
    .map(parseMovieLine);

  connectToDb()
    .then((moviesCollection) => {
      movies.forEach(movie => {
        const _id = new ObjectID(movie._id);
        const runtime = parseInt(movie.runtime, 10);

        if (++read === movies.length) {
          isDone = true;
        }

        moviesCollection.findOneAndUpdate({ _id }, { $set: { runtime } })
          .then(() => {
            if (++write % 1000 === 0) {
              console.log(`Updated ${write} movies so far...`);
            }

            if (isDone && write === read) {
              console.log('Done updating!!!');
              process.exit();
            }
          });
      });
    });
};

update('runtimes.txt');
