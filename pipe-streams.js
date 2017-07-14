var fs = require('fs');
var { Transform } = require('stream');
var util = require('util');

const readStream = fs.createReadStream('people.txt');

function UpperCaseTransform(options) {
  Transform.call(this, options);
}

util.inherits(UpperCaseTransform, Transform);

UpperCaseTransform.prototype._transform = (chunk, encoding, cb) => {
  cb(null, chunk.toString().toUpperCase());
};

const transformStream = new UpperCaseTransform();

readStream.pipe(transformStream).pipe(process.stdout);