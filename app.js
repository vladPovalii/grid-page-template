var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    path = require('path');

// get cfg with connection information
var env = process.env.NODE_ENV || 'development';
var config = require('./db_config')[env];

// connect to mongoDB
mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);

//test connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected!");
});

var Schema = mongoose.Schema;

var NewsSchema = new Schema({
  _id: {type: String},
  index: {type: Number},
  title: {type: String},
  image: {type: String},
  date: {type: Date, default: new Date()},
  createdOnFormatted: {type: String}
});

mongoose.model('news', NewsSchema);
var news = mongoose.model('news');

var app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/html', 'index.html'));
});

app.get('/news', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/html', 'news.html'));
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/html', 'login.html'));
});

app.get('/api/news', function(req, res) {
  news.find(function(err, docs) {
    docs.forEach(function(item) {
      console.log("Received a GET request for _id: " + item._id);
    })
    res.json(docs);
  });
});

var port = 3000;

app.listen(port);
console.log('server on ' + port);
