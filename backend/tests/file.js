const createError = require('http-errors');
const { BadRequest, InternalServerError } = createError;

const express = require('express');
const app = express();
app.listen(3000);
app.listen(3001);
app.listen(3002);
app.listen(3003);
