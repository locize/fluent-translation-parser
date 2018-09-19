var i18next = require('i18next');
var FsBackend = require('i18next-node-fs-backend');
var middleware = require('i18next-express-middleware');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/fluentTranslationParser.js', function(req, res) {
  fs.readFile(__dirname + '/../fluentTranslationParser.js', 'utf-8', function(err, doc) {
    res.send(doc);
  });
});

app.listen(8080);
