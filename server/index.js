var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var util = require('util');
var clients = [];

const db = require('./db');
const connection = db.openConnection;

io.on('connection', function(socket){
	clients.push(socket.id);
	var clientConnectedMsg = 'User connected ' + util.inspect(socket.id) + ', total: ' + clients.length;
	
	console.log(clientConnectedMsg);
	console.log(io.sockets.connected);

	if(io.sockets.connected[socket.id])
		io.sockets.connected[socket.id].emit('room code', codeForSession(sessionId));

	db.insert(socket.id, codeForSession(socket.id), function (result) {
		if(result) {
			console.log("Added " + socket.id + " to database ");
		}
	});
	
	socket.on('disconnect', function() {
		clients.pop(socket.id);
		var clientDisconnectedMsg = 'User disconnected ' + util.inspect(socket.id) + ', total: ' + clients.length;
		console.log(clientDisconnectedMsg);
 	})
});


function sendEmotion(emotion) {
	console.log('Emotion sent to user');
	io.emit('new message', emotion)
}

function sendEmotionToSession(emotion, session) {
	console.log('Emotion ' + emotion + ' sent to session ' + session);
	if(io.sockets.connected[session])
		io.sockets.connected[session].emit('new message', emotion);
}

app.get('/', function (req, res) {
	res.send("PresentVR")
})

app.get('/r/:roomId', function(req, res) {
	db.sessionForCode(req.params.roomId, function(result) {
		if(result.length)
			res.send({"sessionId": result});
		else
			res.send({"error": "Room not found"});
	});
});

app.post('/r/:sessionId', function(req, res) {
	// Send if the response was successful or not
	res.send("Got emotion " + req.query.emotion + " in session "  + req.params.sessionId);
	sendEmotionToSession(req.query.emotion, req.params.sessionId);
});

http.listen(3000, function() {
	console.log('listening on port 3000');
});

function codeForSession(sessionId) {
	var code = sessionId.slice(0, 4).toUpperCase();
	return code;
}

/*
Testing db functions

db.getAllSessions();

db.sessionExists('test1234', function(result) {
	console.log(result);
});
db.sessionExists('asdf1234', function(result) {
	console.log(result);
});
db.codeForSession('test1234', function(result) {
	console.log(result);
});
db.sessionForCode('test', function(result) {
	console.log(result);
});
db.insert('zyxwvutsadfasdfsdf', 'asdf', function(result) {
	console.log(result);
});

const sessionId = "abcdefg";

db.insert(sessionId, codeForSession(sessionId), function(result) {
	console.log(result);
});

db.remove(sessionId, function (result) {
	console.log(result);
});
*/