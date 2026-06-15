var createError = require('http-errors');
const cors = require('cors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

var connectDb = require('./lib/db');

var indexRouter = require('./routes/index');
var personsRouter = require('./routes/persons');
var usersRouter = require('./routes/users');
var filesPersonRouter = require('./routes/filesPerson');
var filesInformRouter = require('./routes/filesInform');




var app = express();

connectDb();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use('/', indexRouter);
app.use('/persons', personsRouter);
app.use('/users', usersRouter);
app.use('/filesPerson', filesPersonRouter);
app.use('/filesInform', filesInformRouter)



app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
});

module.exports = app;
