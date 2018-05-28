const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
  name: {
    type: String,
    required: true
  }
}, {
    toObject: {
      transform(doc, ret, options) {
        console.log('to object');
        return arguments;
      }
    }
  });

const Model = mongoose.model('Model', schema);

const inst = new Model({
  name: 'asdf'
});
const str = inst.toString();
const json = inst.toJSON();
const val = inst.valueOf();
// console.log(typeof inst.toString());
debugger;
inst.valueOf();
console.log(inst);
JSON.stringify(inst);