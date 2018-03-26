const createError = require('http-errors');
const { BadRequest, InternalServerError } = createError;

const express = require('express');
const app = express();
var s1 = app.listen(3000);
var s2 = app.listen(3001);
console.log(s1 == s2);
app.listen(3002);
app.listen(3003);
