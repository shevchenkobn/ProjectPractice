// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const schema = new Schema({
//   name: {
//     type: String,
//     required: true
//   }
// }, {
//     toObject: {
//       transform(doc, ret, options) {
//         console.log('to object');
//         return arguments;
//       }
//     }
//   });

// const schema2 = new Schema({
//   obj: {
//     type: Schema.Types.ObjectId,
//     ref: 'DeleteMe'
//   }
// })

// const Model = mongoose.model('DeleteMe', schema);
// const Model2 = mongoose.model('DeleteMe2', schema2);

// mongoose.connect('mongodb://127.0.0.1:27017/dummy');

// (async () => {
//   const inst2 = new Model({
//     name: 'asdf'
//   });
//   await inst2.save();
//   const inst = new Model2({
//     obj: inst2.id
//   });
//   await inst.save();
//   const start = Date.now();
//   for (let i = 0; i < 20; i++) {
//     if (!i) {
//       await inst.populate('obj').execPopulate();
//     } else {
//       inst.populated('obj');
//     }
//     console.log(Date.now() - start);
//   }

// })();



// const arr = [];
// const func = (...args) => console.log(args);
// const cb = () => {console.log('cb')};
// console.log(process.memoryUsage());
// let start = process.hrtime();

// for (let i = 0; i < 1e5; i++) {
//   arr[i] = setInterval(func.bind(null, 'string', cb, {a: 1, b: 2}, 4, false), 60000);
// }
// console.log(process.hrtime(start));
// console.log(process.memoryUsage());
// process.exit(0);

const arr = new Array(1e6).fill({});
let start = process.hrtime();
arr.reduce((el, i) => {});
console.log(process.hrtime(start));
start = process.hrtime();
for (let i = 0; i < arr.length; i++) {
  
}
console.log(process.hrtime(start));

start = process.hrtime();
for (let el of arr) {
  
}
console.log(process.hrtime(start));
