const pathToRegexp = require('path-to-regexp');
const path = '/:name/:id(\\d{0,5})', arr = [], regex = pathToRegexp(path, arr);
console.log(regex);