const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const routes = require('./routes');

const app = express();

mongoose.connect('mongodb://localhost:27017/upload', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')));

app.use(routes);

app.listen(3000);