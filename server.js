'use strict';

var express  		= require('express');
var app      		= express();
var http 			= require('http').Server(app);
var io 				= require('socket.io')(http);
var session  		= require('express-session');
var cookieParser	= require('cookie-parser');
var bodyParser 		= require('body-parser');
var morgan 			= require('morgan');
var passport 		= require('passport');
var flash    		= require('connect-flash');
var path 			= require('path');
var requireIndex 	= require('requireindex');
var plugins 		= requireIndex(path.join(__dirname, 'lib'));

this.io 	= io;
this.log 	= log;

for(var pluginName in plugins) {
	plugins[pluginName](this);
}

require('./config/passport')(passport, this);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('port', 3000);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var sessionMiddleware = session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
});

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

require('./app/routes.js')(app, passport, this);
require('./app/socket.js')(io, this);

http.listen(app.get('port'), function() {
	log("Started Tasty Music on localhost:" + app.get('port'));
});

function log(str) {
	var date = new Date();
	var hour = date.getHours();
	if(hour < 10) hour = "0" + hour;
	var min = date.getMinutes();
	if(min < 10) min = "0" + min;
	var sec = date.getSeconds();
	if(sec < 10) sec = "0" + sec;
	console.log("[" + hour + ":" + min + ":" + sec + "] " + str);
}

//var playlistID = new UniqueID();
function UniqueID() {
	this.length = 10;
	this.timestamp = +new Date;

	var _getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var ts = this.timestamp.toString();
	var parts = ts.split("").reverse();
	var id = "";

	for(var i = 0; i < this.length; ++i) {
		var index = _getRandomInt(0, parts.length - 1);
		id += parts[index];
	}

	return id;
}
