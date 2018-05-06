// const mongoose = require('mongoose');
// const { Schema } = mongoose;
// (async () => {
//   const schemaPi$$yuk = new Schema({
//     name: String
//   });
//   const nestedSchema = new Schema({
//     oids: {
//       type: [{
//         type: Schema.Types.ObjectId,
//         ref: 'Child'
//       }],
//       required: true
//     }
//   });
//   const schemaBatya = new Schema({
//     obj: {
//       obj: [{
//         oids: nestedSchema
//       }]
//     }
//   });

//   const connection = mongoose.createConnection('mongodb://127.0.0.1/test');
//   const Parent = connection.model('Parent', schemaBatya);
//   const Child = connection.model('Child', schemaPi$$yuk);

//   const children = [];
//   for (let i = 0; i < 4; i++) {
//     const child = new Child({
//       name: 'child#' + (i + 1)
//     });
//     await child.save();
//     children.push(child._id);
//   }
//   let parent = new Parent({
//     obj: {
//       obj: [{
//         oids: children.slice()
//       }]
//     }
//   });
//   await parent.save();
//   const parentId = parent._id;
//   delete parent;
//   await sleep(100);

//   parent = await Parent.findById(parentId);
//   await parent.populate('obj.obj.0.oids').execPopulate();
//   debugger;
//   connection.close();
// })();

// async function sleep(ms) {
//   return new Promise((res) => {
//     setInterval(res, ms);
//   });
// }

console.log(Date.now());
setTimeout(() => console.log(Date.now()), 0);