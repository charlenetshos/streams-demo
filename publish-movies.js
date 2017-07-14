const rascal = require('rascal');
const Promise = require('bluebird');
const pressure = require('pressure-stream');
const { MongoClient } = require('mongodb');
const rascalConfig = require('./rascal-config.json');

let counter = 0;
const limit = 10000;

const createBroker = () => new Promise((resolve, reject) => {
  const config = rascal.withDefaultConfig(rascalConfig);
  rascal.createBroker(config, {}, (error, rascalBroker) => {
    if (error) {
      return reject(error);
    }

    rascalBroker.subscribe('movies_updates', (subErr, subscription) => {
      if (subErr) {
        return reject('Error subscribing to movies updates queue');
      }

      subscription.on('message', (message, content, ackOrNack) => {
        console.log(`Got movie with ID ${content._id}, counter: ${counter}`);
        ackOrNack();

      });
    });

    rascalBroker.subscribe('dead_letters:movies_updates', (subErr, subscription) => {
      if (subErr) {
        return reject('Error subscribing to movies updates queue');
      }

      subscription.on('message', (message, content) => {
        console.log(`Dead lettered movie with ID ${content._id}`);
      });
    });

    return resolve(rascalBroker);
  });
});

const connectToDb = () =>
  MongoClient
    .connect('mongodb://localhost:27017/jsinsa')
    .then((db) => db.collection('movies'));

const publishMovie = (broker, movie) => new Promise((resolve, reject) => {
  broker.publish('jsinsa', movie, '#', (pubError) => {
    if (pubError) {
      return reject(pubError);
    }
    return resolve(`Published movie with ID ${movie._id}`);
  });
});

const publish = (limit) =>
  Promise.all([createBroker(), connectToDb()])
    .then((result) => {
      const [broker, moviesCollection] = result;
      const moviesStream = moviesCollection.find().limit(limit).stream();

      moviesStream
        .on('data', (data) => {
          counter++;
          setTimeout(() => {
            publishMovie(broker, data);
          }, 1000);
        })
        .on('end', () => {
          console.log(`Done reading movies, total: ${counter}`);
        });
    });


publish(limit);
