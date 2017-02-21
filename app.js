var express = require('express'),
    cookieParser = require('cookie-parser');
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    path = require('path'),
    csrf = require('csurf'),
    fs = require('fs'),
    session = require('express-session');

// environment
var env = process.env.NODE_ENV || 'development';

// db connection
var config = require('./config')[env];
mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected!');
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

var app = express(),
    csrfProtection = csrf({cookie: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: config.secretKey, resave: false, saveUninitialized: false}));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/html', 'index.html'));
});

app.get('/news', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/html', 'news.html'));
});

app.get('/login', csrfProtection, function(req, res) {
  var html = fs.readFileSync(path.join(__dirname, '/public/html', 'login.html'), 'utf8');
  res.send(html.replace('{{csrfToken}}', req.csrfToken()));
});

app.get('/api/news', function(req, res) {
  news.find(function(err, docs) {
    docs.forEach(function(item) {
      console.log('Received a GET request for _id: ' + item._id);
    })
    res.json(docs);
  });
});

var port = 3000;

app.listen(port);
console.log('server on ' + port);
