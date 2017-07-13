const fs = require('fs');
const chance = require('chance').Chance();

const names = chance.unique(chance.name, 10001);

fs.writeFileSync('people.txt', `${names.join('\n')}`);
