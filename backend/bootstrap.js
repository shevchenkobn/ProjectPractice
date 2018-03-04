const fs = require('fs');
const vm = require('vm');

var mainCode = fs.readFileSync(__dirname + '/dist/index.js');
vm.runInThisContext(module.constructor.wrap(mainCode), 'file://app/main.js')(exports, require, module, __filename, __dirname, process, global, Buffer);