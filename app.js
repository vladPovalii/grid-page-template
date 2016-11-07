var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

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
  date: { type: Date, default: Date.now },
  createdOnFormatted: Buffer
});

mongoose.model('news', NewsSchema);
var news = mongoose.model('news');

var app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/news', function(req, res) {
  news.find(function(err, docs) {
    docs.forEach(function(item) {
      console.log("Received a GET request for _id: " + item._id);
    })
    res.send(docs);
  });
});

var port = 3000;

app.listen(port);
console.log('server on ' + port);