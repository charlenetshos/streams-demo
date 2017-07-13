const { MongoClient } = require('mongodb');
const random = require('generate-random-data');
const chance = require('chance').Chance();

const url = 'mongodb://localhost:27017/jsinsa';
const max = 1000000;
const genres = [
  'Animation',
  'Adventure',
  'Comedy',
  'Drama',
  'Thriller',
  'Action film',
  'Fiction',
  'Fantasy',
  'Art film',
  'Romance',
  'Family',
  'Crime'
];

const today = new Date();

const batchInsert = (collection, total) => {
  if (total < max) {
    const documents = [];
    for (let counter = 1; counter <= 50000; counter++) {
      documents.push({
        title: random.title(),
        year: random.int(1990, today.getFullYear()),
        released: random.randomDate('1990-01-01', today.toISOString()),
        country: chance.country({ full: true }),
        genres: random.pickSome(genres, 2, true),
        director: random.name(),
        actors: chance.unique(chance.name, 3),
        details: {
          votes: random.int(0, max),
          rating: random.float(0, 9, 0, 9, 1),
          reviews: random.int(0, max),
        }
    });
    }
    return collection.insertMany(documents)
      .then((result) => {
        total += result.result.n;
        console.log(`${total} documents inserted so far`);
        return batchInsert(collection, total);
      });
  }
  return Promise.resolve(total);
};

MongoClient.connect(url)
  .then((db) => {
    const moviesCollection = db.collection('movies');
    const total = 0;

    moviesCollection.createIndexes([
      { key: { _id: 1 }, unique: true, background: true },
      { key: { year: 1 }, background: true },
      { key: { country: 1 }, background: true },
    ])
      .then(() => batchInsert(moviesCollection, total))
      .then((count) => {
        console.log(`Done inserting ${count} documents`);
        process.exit();
      })
  })
  .catch((err) => console.log('Something went wrong', err));
