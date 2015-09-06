var express = require('express'),
		exphbs = require('express-handlebars'),
		http = require('http'),
		mongoose = require('mongoose'),
		twitter = require('ntwitter'),
		routes = require('./routes'),
		config = require('./config'),
		streamHandler = require('./utils/streamHandler');


// Create express server
var app = express();
var port = process.env.PORT || 8080;

// Set handlebars as the templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Disable etag headers on response (https://en.wikipedia.org/wiki/HTTP_ETag).
app.disable('etag');

// Connect to mongo db
mongoose.connect('mongodb://localhost/server-rendered-react');

// Create ntwitter instance
var twit = new twitter(config.twitter);


// Index route
app.get('/', routes.index);

// Page route
app.get('/page/:page/:skip', routes.page);

// Set /public as out static content dir
app.use("/", express.static(__dirname + "/public/"));

// Start server
var server = http.createServer(app).listen(port, function() {
	console.log('Express server listening on port ' + port);
})

// Initialize socket.io
var io = require('socket.io').listen(server);

// Set a stream listener for tweets matching tracking keywords
twit.stream('statuses/filter', {track: 'emberjs, #emberjs, reactjs, #reactjs '}, 
	function (stream) {
		streamHandler(stream, io);
});